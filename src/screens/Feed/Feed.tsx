import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../components/TopNav";
import {
  Search,
  Close,
  FilterList,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import {
  getListingsService,
  getFavoritesService,
  addFavoriteService,
  removeFavoriteService,
  Listing,
} from "../../services";
import {
  formatCurrency,
  getImageUrl,
  getListingTypeLabel,
} from "../../utils/format";
import "./Feed.css";
import { useAccount } from "../../contexts/AccountContext";

const LISTING_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "venda", label: "Venda" },
  { value: "doacao", label: "Doação" },
  { value: "troca", label: "Troca" },
];

interface Filters {
  priceRange: [number, number];
  state: string[];
  listingType: string[];
  location: string;
}

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showFilters, setShowFilters] = useState(() => window.innerWidth >= 768);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { user: currentUser } = useAccount();
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  });
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 1000],
    state: [],
    listingType: [],
    location: "",
  });
  const [priceBounds, setPriceBounds] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });

  useEffect(() => {
    const loadPriceBounds = async () => {
      try {
        const condition =
          filters.state.length > 0 ? filters.state[0] : undefined;
        const listingType =
          filters.listingType.length > 0 ? filters.listingType[0] : undefined;
        const response = await getListingsService({
          q: searchQuery || undefined,
          condition,
          listingType,
          city: filters.location || undefined,
          sortBy: "price",
          sortOrder: "asc",
          page: 1,
          limit: 100,
        });
        const list = response.data || [];
        const prices = list
          .map((i) => i.price)
          .filter((p): p is number => p !== null && typeof p === "number");
        if (prices.length > 0) {
          const max = Math.max(...prices);
          setPriceBounds({ min: 0, max });
        }
      } catch {
        setPriceBounds({ min: 0, max: 1000 });
      }
    };
    loadPriceBounds();
  }, [searchQuery, filters.state, filters.listingType, filters.location]);

  useEffect(() => {
    if (
      filters.priceRange[0] === 0 &&
      filters.priceRange[1] === 1000 &&
      (priceBounds.min !== 0 || priceBounds.max !== 1000)
    ) {
      setFilters((f) => ({ ...f, priceRange: [0, priceBounds.max] }));
    }
  }, [priceBounds.min, priceBounds.max, filters.priceRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    sortBy,
    filters.priceRange,
    filters.state,
    filters.listingType,
    filters.location,
  ]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const list = await getFavoritesService();
        const ids = new Set((list || []).map((fav) => fav.item.id));
        setFavorites(ids);
      } catch {
        setFavorites(new Set());
      }
    };
    loadFavorites();
  }, []);

  const MOBILE_BREAKPOINT = 768;
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);
      try {
        const sortByMap: Record<
          string,
          { sortBy: string; sortOrder: "asc" | "desc" }
        > = {
          "price-asc": { sortBy: "price", sortOrder: "asc" },
          "price-desc": { sortBy: "price", sortOrder: "desc" },
        };

        const sortConfig = sortBy ? sortByMap[sortBy] : null;
        const condition =
          filters.state.length > 0 ? filters.state[0] : undefined;
        const listingType =
          filters.listingType.length > 0 ? filters.listingType[0] : undefined;

        const response = await getListingsService({
          q: searchQuery || undefined,
          condition,
          listingType,
          priceMin:
            filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          priceMax:
            filters.priceRange[1] < priceBounds.max
              ? filters.priceRange[1]
              : undefined,
          city: filters.location || undefined,
          ...(sortConfig
            ? { sortBy: sortConfig.sortBy, sortOrder: sortConfig.sortOrder }
            : {}),
          page: currentPage,
          limit: 12,
        });

        setItems(response.data || []);
        if (response.meta) {
          setPaginationMeta(response.meta);
        }
      } catch (error: any) {
        console.error("Error loading listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, [
    searchQuery,
    sortBy,
    filters.priceRange,
    filters.state,
    filters.listingType,
    filters.location,
    currentPage,
  ]);

  const toggleFavorite = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (favorites.has(itemId)) {
        await removeFavoriteService(itemId);
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          newFavorites.delete(itemId);
          return newFavorites;
        });
      } else {
        await addFavoriteService(itemId);
        setFavorites((prev) => new Set(prev).add(itemId));
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
    }
  };

  const hasSidebarFilters =
    filters.state.length > 0 ||
    filters.listingType.length > 0 ||
    filters.location.trim() !== "" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < priceBounds.max;

  const clearSidebarFilters = () => {
    setFilters({
      priceRange: [0, priceBounds.max],
      state: [],
      listingType: [],
      location: "",
    });
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filters.state.length > 0 ||
    filters.listingType.length > 0 ||
    filters.location.trim() !== "" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < priceBounds.max;

  const emptyStateTitle = hasActiveFilters
    ? "Nenhum item encontrado com os filtros aplicados"
    : "Nenhum item no feed no momento";

  const emptyStateDescription = hasActiveFilters
    ? "Tente alterar a busca ou os filtros para ver outros itens."
    : "Volte mais tarde ou use a busca e os filtros para encontrar itens.";

  return (
    <div className="feed-screen">
      <TopNav />
      <div className="feed-container">
        <div className="feed-layout">
          <div className={`filter-sidebar ${showFilters ? "open" : ""}`}>
            <div className="filter-sidebar-content">
              <div className="filter-header">
                <h2>Filtros</h2>
                <button
                  className="close-filters"
                  onClick={() => setShowFilters(false)}
                >
                  <Close />
                </button>
              </div>

              <div className="filter-section">
                <h3>Tipo de anúncio</h3>
                {LISTING_TYPE_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.listingType.includes(value)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.checked) {
                          setFilters({
                            ...filters,
                            listingType: [...filters.listingType, value],
                          });
                        } else {
                          setFilters({
                            ...filters,
                            listingType: filters.listingType.filter(
                              (t) => t !== value,
                            ),
                          });
                        }
                      }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <div className="filter-section">
                <h3>Estado do item</h3>
                {[
                  "Novo",
                  "Usado - Excelente",
                  "Usado - Bom",
                  "Usado - Regular",
                ].map((state) => (
                  <label key={state} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.state.includes(state)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.checked) {
                          setFilters({
                            ...filters,
                            state: [...filters.state, state],
                          });
                        } else {
                          setFilters({
                            ...filters,
                            state: filters.state.filter((s) => s !== state),
                          });
                        }
                      }}
                    />
                    <span>{state}</span>
                  </label>
                ))}
              </div>

              <div className="filter-section">
                <h3>Faixa de preço</h3>
                <div className="price-inputs-row">
                  <div className="price-input-group">
                    <label>Mínimo</label>
                    <div className="price-input-wrapper">
                      <span className="price-input-prefix">R$</span>
                      <input
                        type="number"
                        min={0}
                        max={filters.priceRange[1]}
                        value={filters.priceRange[0] || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const val = Math.max(0, Number(e.target.value));
                          setFilters((f) => ({ ...f, priceRange: [val, f.priceRange[1]] }));
                        }}
                        className="price-input"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <span className="price-input-separator">—</span>
                  <div className="price-input-group">
                    <label>Máximo</label>
                    <div className="price-input-wrapper">
                      <span className="price-input-prefix">R$</span>
                      <input
                        type="number"
                        min={filters.priceRange[0]}
                        value={filters.priceRange[1] || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const val = Math.max(0, Number(e.target.value));
                          setFilters((f) => ({ ...f, priceRange: [f.priceRange[0], val] }));
                        }}
                        className="price-input"
                        placeholder={String(priceBounds.max)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="filter-section">
                <h3>Localização</h3>
                <input
                  type="text"
                  className="input"
                  placeholder="Digite a cidade"
                  value={filters.location}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                />
              </div>

              {hasSidebarFilters && (
                <div className="filter-section filter-clear-section">
                  <button
                    type="button"
                    className="filter-clear-btn"
                    onClick={clearSidebarFilters}
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={`feed-main ${showFilters ? "filters-panel-open" : ""}`}>
            <div className={`search-sort-bar ${!showFilters ? "filters-collapsed" : ""}`}>
              <div className="search-container">
                <button
                  type="button"
                  className={`filter-toggle ${showFilters ? "active-filters" : ""}`}
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label={showFilters ? "Fechar filtros" : "Abrir filtros"}
                >
                  <FilterList />
                </button>
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar"
                    value={searchQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="sort-options">
                <button
                  className={`sort-btn ${sortBy === "price-asc" ? "active" : ""}`}
                  onClick={() => setSortBy("price-asc")}
                >
                  Menor preço
                </button>
                <button
                  className={`sort-btn ${sortBy === "price-desc" ? "active" : ""}`}
                  onClick={() => setSortBy("price-desc")}
                >
                  Maior preço
                </button>
                <button
                  className={`sort-btn ${filters.listingType.includes("venda") ? "active" : ""}`}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      listingType: f.listingType.includes("venda")
                        ? f.listingType.filter((t) => t !== "venda")
                        : [...f.listingType, "venda"],
                    }))
                  }
                >
                  Venda
                </button>
                <button
                  className={`sort-btn ${filters.listingType.includes("doacao") ? "active" : ""}`}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      listingType: f.listingType.includes("doacao")
                        ? f.listingType.filter((t) => t !== "doacao")
                        : [...f.listingType, "doacao"],
                    }))
                  }
                >
                  Doação
                </button>
                <button
                  className={`sort-btn ${filters.listingType.includes("troca") ? "active" : ""}`}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      listingType: f.listingType.includes("troca")
                        ? f.listingType.filter((t) => t !== "troca")
                        : [...f.listingType, "troca"],
                    }))
                  }
                >
                  Troca
                </button>
              </div>
            </div>

            <div className="items-list">
              {isLoading ? (
                <div className="sk-feed-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="sk-feed-card">
                      <div className="sk sk-feed-card-img" />
                      <div className="sk-feed-card-body">
                        <div className="sk sk-text" style={{ width: '75%' }} />
                        <div className="sk sk-text-sm" style={{ width: '50%' }} />
                        <div className="sk sk-text-sm" style={{ width: '35%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="feed-empty-state">
                  <img
                    src={require("../../Images/materna_amiga_empty_filter_no_text.png")}
                    alt=""
                    className="feed-empty-state-image"
                  />
                  <h3 className="feed-empty-state-title">{emptyStateTitle}</h3>
                  <p className="feed-empty-state-description">
                    {emptyStateDescription}
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const isFavorite = favorites.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="item-card"
                      onClick={() => navigate(`/item/${item.id}`)}
                    >
                      <div className="item-image-placeholder">
                        {currentUser?.id !== item.ownerId && (
                        <button
                          className={`favorite-btn ${isFavorite ? "is-favorite" : ""}`}
                          onClick={(e) => toggleFavorite(item.id, e)}
                        >
                          {isFavorite ? <Favorite /> : <FavoriteBorder />}
                        </button>
                        )}
                        {(() => {
                          const imageUrl = getImageUrl(item.photos?.[0]);
                          return imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                console.error("Error loading image:", imageUrl);
                                e.currentTarget.style.display = "none";
                                const placeholder =
                                  e.currentTarget.parentElement?.querySelector(
                                    ".placeholder-content",
                                  );
                                if (placeholder) {
                                  (placeholder as HTMLElement).style.display =
                                    "flex";
                                }
                              }}
                            />
                          ) : null;
                        })()}
                        {(!item.photos ||
                          item.photos.length === 0 ||
                          !getImageUrl(item.photos[0])) && (
                          <div className="placeholder-content">Imagem</div>
                        )}
                      </div>
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        {item.price !== null ? (
                          <div className="item-price">
                            {formatCurrency(item.price)}
                          </div>
                        ) : (
                          <div
                            className="item-price"
                            style={{ fontStyle: "italic", color: "#666" }}
                          >
                            {getListingTypeLabel(item.listingType)}
                          </div>
                        )}
                        {item.city && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "4px",
                            }}
                          >
                            {item.city}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {paginationMeta.pages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1 || isLoading}
                >
                  Anterior
                </button>
                <div className="pagination-pages">
                  {Array.from(
                    { length: paginationMeta.pages },
                    (_, i) => i + 1,
                  ).map((page) => {
                    if (
                      page === 1 ||
                      page === paginationMeta.pages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-page-btn ${currentPage === page ? "active" : ""}`}
                          onClick={() => setCurrentPage(page)}
                          disabled={isLoading}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(paginationMeta.pages, prev + 1),
                    )
                  }
                  disabled={currentPage === paginationMeta.pages || isLoading}
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div
          className="filter-overlay"
          onClick={() => setShowFilters(false)}
        ></div>
      )}
    </div>
  );
};

export default Feed;
