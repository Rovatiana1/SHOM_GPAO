import { MenuSection } from "../../types/Menu";
import { User, UserRole } from "../../types/Users";

export const menuConfig: MenuSection[] = [
  {
    title: "Traitement",
    items: [
      {
        title: "Traitement",
        titlePage: "Traitement",
        icon: "fas fa-tasks", // Traitement
        to: "/processing",
        roles: ["ADMIN", "MANAGER", "USER"],
      },
    ],
    sidebar: [
      {
        title: "Traitement",
        items: [
          {
            title: "CQ cible",
            titlePage: "Contrôle qualité",
            icon: "fas fa-check-circle",
            to: "/processing",
            roles: ["ADMIN", "MANAGER", "USER"],
          },
          {
            title: "CQ ISO",
            titlePage: "Contrôle qualité",
            icon: "fas fa-clipboard-check", // même logique pour CQ
            to: "/processing/cq-iso",
            roles: ["ADMIN", "MANAGER", "USER"],
          },
          {
            title: "Autres traitements",
            titlePage: "Autres traitements",
            icon: "fas fa-cogs", // Paramètres / traitements divers
            to: "/processing/other",
            roles: ["ADMIN", "MANAGER", "USER"],
          },
        ],
      },
    ],
  },
  {
    title: "Tableau de bord",
    items: [
      {
        title: "Tableau de bord",
        titlePage: "TDB",
        icon: "fas fa-tachometer-alt", // Dashboard
        to: "/dashboard",
        roles: ["ADMIN", "MANAGER", "USER"],
      },
    ],
  }
];


// Filtrer le menu selon le rôle
export const getFilteredMenu = (user: User): MenuSection[] => {
  const hasAccess = (allowedRoles: UserRole[] | undefined) => {
    if (!allowedRoles || allowedRoles.length === 0) return true; // No roles defined means public
    return user.roles.some(userRole => allowedRoles.includes(userRole));
  };

  return menuConfig
    .filter((section) => hasAccess(section.roles))
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => hasAccess(item.roles))
        .map((item) => ({
          ...item,
          items: item.items
            ? item.items.filter(
                (subItem) => hasAccess(subItem.roles)
              )
            : undefined,
        })),
      sidebar: section.sidebar?.map((sidebarSection) => ({
        ...sidebarSection,
        items: sidebarSection.items
          .filter((item) => hasAccess(item.roles))
          .filter((item) => {
            if (item.title === "CQ cible") {
              return user.idEtape === 4674;
            }
            if (item.title === "CQ ISO") {
              return user.idEtape === 4688;
            }
            return true;
          }),
      })),
    }));
};