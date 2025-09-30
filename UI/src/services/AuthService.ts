// // import env from "../config/env";
// // import { User, UserRole } from "../types/Users";

// // const API_URL = `http://localhost:6003/api/auth/`;

// // export interface LoginResponse {
// //   token: string;
// //   userId: string;
// //   userName: string;
// //   roles: UserRole[];
// // }

// // class AuthService {
// //   async login(login: string, password: string): Promise<LoginResponse> {
// //     const response = await fetch(`${API_URL}/ldaps`, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({ login, password }),
// //     });

// //     console.log("response ==+>", response);

// //     if (!response.ok) {
// //       let errorMsg = "Authentication failed";
// //       try {
// //         const errorData = await response.json();
// //         errorMsg = errorData.message || errorMsg;
// //       } catch (e) {
// //         errorMsg = response.statusText || errorMsg;
// //       }
// //       throw new Error(errorMsg);
// //     }

// //     const data: LoginResponse = await response.json();

// //     console.log("data ==+>", data);
// //     if (data.token) {
// //       sessionStorage.setItem("auth_gpao_token", data.token);
// //       const user: User = {
// //         userId: data.userId,
// //         userName: data.userName,
// //         roles: data.roles
// //       };
// //       sessionStorage.setItem("auth_gpao_user", JSON.stringify(user));
// //     }
// //     return data;
// //   }

// //   logout(): void {
// //     sessionStorage.removeItem("auth_gpao_token");
// //     sessionStorage.removeItem("auth_gpao_user");
// //   }

// //   getToken(): string | null {
// //     return sessionStorage.getItem("auth_gpao_token");
// //   }

// //   isAuthenticated(): boolean {
// //     return !!this.getToken();
// //   }

// //   getCurrentUser(): User | null {
// //     const userStr = sessionStorage.getItem("auth_gpao_user");
// //     if (userStr) {
// //         try {
// //             return JSON.parse(userStr);
// //         } catch (e) {
// //             console.error("Failed to parse user from session storage", e);
// //             return null;
// //         }
// //     }
// //     return null;
// //   }
// // }

// // export default new AuthService();


// import env from "../config/env";
// import { User, UserRole } from "../types/Users";

// const API_URL = `http://localhost:6003/api/auth/`;

// export interface LoginResponse {
//   token: string;
//   userId: string;
//   userName: string;
//   roles: UserRole[];
// }

// class AuthService {
//   async login(login: string, password: string, idEtape: number): Promise<LoginResponse> {
//     const response = await fetch(`${API_URL}/ldaps`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ login, password }),
//     });

//     console.log("response ==+>", response);

//     if (!response.ok) {
//       let errorMsg = "Authentication failed";
//       try {
//         const errorData = await response.json();
//         errorMsg = errorData.message || errorMsg;
//       } catch (e) {
//         errorMsg = response.statusText || errorMsg;
//       }
//       throw new Error(errorMsg);
//     }

//     const data: LoginResponse = await response.json();

//     console.log("data ==+>", data);
//     if (data.token) {
//       sessionStorage.setItem("auth_gpao_token", data.token);
//       const user: User = {
//         userId: data.userId,
//         userName: data.userName,
//         roles: data.roles,
//         idEtape: idEtape,
//       };
//       sessionStorage.setItem("auth_gpao_user", JSON.stringify(user));
//     }
//     return data;
//   }

//   logout(): void {
//     sessionStorage.removeItem("auth_gpao_token");
//     sessionStorage.removeItem("auth_gpao_user");
//   }

//   getToken(): string | null {
//     return sessionStorage.getItem("auth_gpao_token");
//   }

//   isAuthenticated(): boolean {
//     return !!this.getToken();
//   }

//   getCurrentUser(): User | null {
//     const userStr = sessionStorage.getItem("auth_gpao_user");
//     if (userStr) {
//         try {
//             return JSON.parse(userStr);
//         } catch (e) {
//             console.error("Failed to parse user from session storage", e);
//             return null;
//         }
//     }
//     return null;
//   }
// }

// export default new AuthService();



import env from "../config/env";
import { User, UserRole } from "../types/Users";

const API_URL = `http://localhost:6003/api/auth/`;

export interface LoginResponse {
  token: string;
  userId: string;
  userName: string;
  roles: UserRole[];
}

class AuthService {
  async login(login: string, password: string, idEtape: number, idLotClient: number): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/ldaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    console.log("response ==+>", response);

    if (!response.ok) {
      let errorMsg = "Authentication failed";
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        errorMsg = response.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const data: LoginResponse = await response.json();

    console.log("data ==+>", data);
    if (data.token) {
      sessionStorage.setItem("auth_gpao_token", data.token);
      const user: User = {
        userId: data.userId,
        userName: data.userName,
        roles: data.roles,
        idEtape: idEtape,
        idLotClient: idLotClient,
      };
      sessionStorage.setItem("auth_gpao_user", JSON.stringify(user));
    }
    return data;
  }

  logout(): void {
    sessionStorage.removeItem("auth_gpao_token");
    sessionStorage.removeItem("auth_gpao_user");
  }

  getToken(): string | null {
    return sessionStorage.getItem("auth_gpao_token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem("auth_gpao_user");
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error("Failed to parse user from session storage", e);
            return null;
        }
    }
    return null;
  }
}

export default new AuthService();
