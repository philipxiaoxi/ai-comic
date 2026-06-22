package com.superapp.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.superapp.ui.screens.AppMarketScreen
import com.superapp.ui.screens.AppRunnerScreen
import com.superapp.ui.screens.MyAppsScreen
import com.superapp.ui.theme.SuperAppTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SuperAppTheme {
                MainScreen()
            }
        }
    }
}

sealed class Screen(val route: String, val title: String) {
    object Market : Screen("market", "应用市场")
    object MyApps : Screen("my_apps", "我的应用")
    object AppRunner : Screen("app_runner/{appId}", "应用") {
        fun createRoute(appId: String) = "app_runner/$appId"
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomBarRoutes = listOf(Screen.Market.route, Screen.MyApps.route)
    val showBottomBar = currentRoute in bottomBarRoutes

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.ShoppingCart, contentDescription = null) },
                        label = { Text(Screen.Market.title) },
                        selected = currentRoute == Screen.Market.route,
                        onClick = {
                            navController.navigate(Screen.Market.route) {
                                popUpTo(Screen.Market.route) { inclusive = true }
                            }
                        }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Home, contentDescription = null) },
                        label = { Text(Screen.MyApps.title) },
                        selected = currentRoute == Screen.MyApps.route,
                        onClick = {
                            navController.navigate(Screen.MyApps.route) {
                                popUpTo(Screen.Market.route)
                            }
                        }
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Market.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Screen.Market.route) {
                AppMarketScreen(
                    onAppClick = { appId ->
                        navController.navigate(Screen.AppRunner.createRoute(appId))
                    }
                )
            }

            composable(Screen.MyApps.route) {
                MyAppsScreen(
                    onAppClick = { appId ->
                        navController.navigate(Screen.AppRunner.createRoute(appId))
                    }
                )
            }

            composable(
                route = Screen.AppRunner.route,
                arguments = listOf(navArgument("appId") { type = NavType.StringType })
            ) { backStackEntry ->
                val appId = backStackEntry.arguments?.getString("appId") ?: return@composable
                AppRunnerScreen(
                    appId = appId,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
