// import { useNavigation } from "@react-navigation/native";
// import { useState } from "react";
// import { supabase } from "../lib/supabase";
// import { useNotification } from "./useNotification";

// export function useAuthGuard() {
//     const { showAlert } = useNotification();
//     const navigation = useNavigation<any>();
//     const [isAuthenticated, setIsAuthenticated] = useState(false);

//     const checkAuth = async (action: string = "continue"): Promise<boolean> => {
//         try {
//             const { data } = await supabase.auth.getSession();

//             if (!data.session) {
//                 showAlert({
//                     type: "info",
//                     title: "Login Required",
//                     message: `Please login or sign up to ${action}`,
//                     showCancel: true,
//                     confirmText: "Login / Sign Up",
//                     onConfirm: () => {
//                         // Traverse to root and navigate to Login
//                         // const parent = navigation.getParent("root-drawer") || navigation;
//                         // parent.navigate("Login");


//                         // navigation.getParent()?.getParent()?.getParent()?.navigate("Login");


//                         const rootNavigation = navigation.getParent("root-stack");

// if (rootNavigation) {
//     rootNavigation.navigate("Login");
// } else {
//     navigation.navigate("Login");
// }
//                     }
//                 });
//                 return false;
//             }

//             setIsAuthenticated(true);
//             return true;
//         } catch (error) {
//             console.error("Auth check error:", error);
//             return false;
//         }
//     };

//     return { checkAuth, isAuthenticated };
// }


















// import { DrawerActions, useNavigation } from "@react-navigation/native";
// import { useState } from "react";
// import { supabase } from "../lib/supabase";

// export function useAuthGuard() {
//     const navigation = useNavigation<any>();
//     const [isAuthenticated, setIsAuthenticated] = useState(false);

//     const checkAuth = async (action: string = "continue"): Promise<boolean> => {
//         try {
//             const { data } = await supabase.auth.getSession();

//             if (!data.session) {
//                 // 🔓 Not logged in → open the drawer instead of showing an alert.
//                 // The drawer contains the "Login / Sign Up" button.
//                 const drawerNav = navigation.getParent("root-drawer") || navigation;
//                 drawerNav.dispatch(DrawerActions.toggleDrawer());
//                 return false;
//             }

//             setIsAuthenticated(true);
//             return true;
//         } catch (error) {
//             console.error("Auth check error:", error);
//             return false;
//         }
//     };

//     return { checkAuth, isAuthenticated };
// }



















import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuthGuard() {
    const navigation = useNavigation<any>();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async (action: string = "continue"): Promise<boolean> => {
        try {
            const { data } = await supabase.auth.getSession();

            if (!data.session) {
                Alert.alert(
                    "Login Required",
                    `Please login or sign up to ${action}`,
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Login / Sign Up",
                            onPress: () => {
                                let nav: any = navigation;
                                while (nav) {
                                    const state = nav.getState?.();
                                    const routeNames = state?.routeNames || [];
                                    if (routeNames.includes("Login")) {
                                        nav.navigate("Login");
                                        return;
                                    }
                                    nav = nav.getParent?.();
                                }
                                const rootNav = navigation.getParent("root-stack");
                                if (rootNav) {
                                    rootNav.navigate("Login");
                                } else {
                                    navigation.navigate("Login");
                                }
                            },
                        },
                    ]
                );
                return false;
            }

            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error("Auth check error:", error);
            return false;
        }
    };

    return { checkAuth, isAuthenticated };
}