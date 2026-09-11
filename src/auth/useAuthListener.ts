// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useEffect } from "react";
// import { supabase } from "../lib/supabase";

// export function useAuthListener(navigation: any) {
//   useEffect(() => {
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (event, session) => {
//       // Handle token refresh errors
//       if (event === "TOKEN_REFRESHED" && !session) {
//         console.log("⚠️ Token refresh failed, clearing session");
//         await supabase.auth.signOut();
//         await AsyncStorage.removeItem("supabase.auth.token");
//       }

//       if (session) {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Home" }],
//         });
//       }
//     });

//     // Handle refresh token errors globally
//     const checkSession = async () => {
//       try {
//         const { data: { session }, error } = await supabase.auth.getSession();

//         if (error) {
//           console.log("⚠️ Session error:", error.message);
//           if (error.message.includes("refresh_token_not_found") ||
//             error.message.includes("Invalid Refresh Token")) {
//             console.log("🔄 Clearing invalid session");
//             await supabase.auth.signOut();
//             await AsyncStorage.clear();
//           }
//         }
//       } catch (err) {
//         console.error("Error checking session:", err);
//       }
//     };

//     checkSession();

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [navigation]);
// }



















import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useAuthListener(navigation: any) {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "[AuthListener] Event:",
        event,
        "User:",
        session?.user?.id
      );

      // Handle token refresh failure
      if (event === "TOKEN_REFRESHED" && !session) {
        console.log(
          "⚠️ Token refresh failed, clearing session"
        );

        try {
          await supabase.auth.signOut();
          await AsyncStorage.removeItem("supabase.auth.token");
        } catch (error) {
          console.error(
            "[AuthListener] Error clearing failed session:",
            error
          );
        }

        return;
      }

      // IMPORTANT:
      // Do NOT navigate to Home here on SIGNED_IN.
      //
      // App.tsx is responsible for:
      // 1. Handling Google OAuth
      // 2. Calling setSession()
      // 3. Checking profile completeness
      // 4. Navigating to HomeDrawer / CompleteProfile
      //
      // Having another navigation here can cause
      // competing navigation during Google authentication.

      if (event === "SIGNED_IN" && session) {
        console.log(
          "[AuthListener] SIGNED_IN received for user:",
          session.user.id
        );

        // No navigation here.
      }

      if (event === "SIGNED_OUT") {
        console.log("[AuthListener] User signed out");
      }
    });

    // Check existing session / invalid refresh token
    const checkSession = async () => {
      try {
        console.log("[AuthListener] Checking existing session...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.log(
            "⚠️ Session error:",
            error.message
          );

          const isInvalidRefreshToken =
            error.message.includes("refresh_token_not_found") ||
            error.message.includes("Invalid Refresh Token") ||
            error.message.includes("Refresh Token");

          if (isInvalidRefreshToken) {
            console.log(
              "🔄 Invalid refresh token detected, clearing session"
            );

            try {
              await supabase.auth.signOut();
            } catch (signOutError) {
              console.error(
                "[AuthListener] Sign out error:",
                signOutError
              );
            }

            // Do NOT clear the entire AsyncStorage.
            // Other application data may be stored there.
            await AsyncStorage.removeItem(
              "supabase.auth.token"
            );
          }

          return;
        }

        if (session?.user) {
          console.log(
            "[AuthListener] Existing session found:",
            session.user.id
          );
        } else {
          console.log(
            "[AuthListener] No existing session found"
          );
        }
      } catch (err) {
        console.error(
          "[AuthListener] Error checking session:",
          err
        );
      }
    };

    checkSession();

    return () => {
      console.log(
        "[AuthListener] Removing auth subscription"
      );

      subscription.unsubscribe();
    };
  }, [navigation]);
}