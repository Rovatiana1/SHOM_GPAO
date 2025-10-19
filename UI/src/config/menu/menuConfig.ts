import { MenuSection } from "../../types/Menu";
import { User, UserRole } from "../../types/Users";

export const menuConfig: MenuSection[] = [
  {
    title: "Administration",
    items: [
      {
        title: "Administration",
        titlePage: "Administration",
        icon: "fas fa-user-shield",
        to: "/admin",
        roles: ["ADMIN"],
      },
    ],
    sidebar: [
      {
        title: "Gestion",
        items: [
          {
            title: "Dashboard",
            titlePage: "Dashboard Admin",
            icon: "fas fa-tachometer-alt",
            to: "/admin",
            roles: ["ADMIN"],
          },
          {
            title: "Utilisateurs",
            titlePage: "Gestion des Utilisateurs",
            icon: "fas fa-users",
            to: "/admin/users",
            roles: ["ADMIN"],
          },
          {
            title: "Dossiers",
            titlePage: "Gestion des Dossiers",
            icon: "fas fa-folder",
            to: "/admin/dossiers",
            roles: ["ADMIN"],
          },
          {
            title: "Étapes",
            titlePage: "Gestion des Étapes",
            icon: "fas fa-flag",
            to: "/admin/etapes",
            roles: ["ADMIN"],
          },
          {
            title: "États",
            titlePage: "Gestion des États",
            icon: "fas fa-shield-alt",
            to: "/admin/etats",
            roles: ["ADMIN"],
          },
          {
            title: "Lots Client",
            titlePage: "Gestion des Lots Client",
            icon: "fas fa-briefcase",
            to: "/admin/lot-clients",
            roles: ["ADMIN"],
          },
          {
            title: "Lots",
            titlePage: "Gestion des Lots",
            icon: "fas fa-layer-group",
            to: "/admin/lots",
            roles: ["ADMIN"],
          },
          {
            title: "Lignes de Temps",
            titlePage: "Gestion des LDTs",
            icon: "fas fa-clock",
            to: "/admin/ldts",
            roles: ["ADMIN"],
          },
        ],
      },
    ],
  },
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