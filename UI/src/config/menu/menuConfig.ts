import { MenuSection } from "../../types/Menu";
import { UserRole } from "../../types/Users";

export const menuConfig: MenuSection[] = [
  {
    title: "Tableau de bord",
    items: [
      {
        title: "Tableau de bord",
        titlePage: "TDB",
        icon: "fas fa-tachometer-alt", // Icône du dashboard
        to: "/dashboard",
        roles: ["admin", "manager", "user"],
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Configuration",
        titlePage: "Configuration",
        icon: "fas fa-cogs", // Icône pour configuration
        to: "/configuration",
        roles: ["admin", "manager", "user"],
      },
    ],
  },
  {
    title: "Gestion Lots",
    items: [
      {
        title: "Gestion Lots",
        titlePage: "Gestion Lots",
        icon: "fas fa-boxes", // Icône pour gestion des lots
        to: "/manage",
        roles: ["admin", "manager", "user"],
      },
    ],
  },
  {
    title: "Traitement",
    items: [
      {
        title: "Traitement",
        titlePage: "Traitement",
        icon: "fas fa-tasks", // Icône pour le traitement
        to: "/processing/cq",
        roles: ["admin", "manager", "user"],
      },
    ],
    sidebar: [
      {
        title: "Traitement",
        items: [
          {
            title: "CQ (Contrôle qualité)",
            titlePage: "Contrôle qualité",
            icon: "fas fa-check-circle",
            to: "/processing/cq",
            roles: ["admin", "manager", "user"],
          },
          {
            title: "Autres traitements",
            titlePage: "Autres traitements",
            icon: "fas fa-cogs",
            to: "/processing/other",
            roles: ["admin", "manager", "user"],
          },
        ]
      }
    ]
  },
];

// Filtrer le menu selon le rôle
export const getFilteredMenu = (role: UserRole): MenuSection[] => {
  return menuConfig
    .filter((section) => !section.roles || section.roles.includes(role))
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => !item.roles || item.roles.includes(role))
        .map((item) => ({
          ...item,
          items: item.items
            ? item.items.filter(
                (subItem) => !subItem.roles || subItem.roles.includes(role)
              )
            : undefined,
        })),
    }));
};