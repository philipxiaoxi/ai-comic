package com.superapp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.superapp.data.local.InstalledApp
import com.superapp.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MyAppsViewModel @Inject constructor(
    private val repository: AppRepository
) : ViewModel() {
    val installedApps: Flow<List<InstalledApp>> = repository.getInstalledApps()

    fun uninstallApp(appId: String) {
        viewModelScope.launch {
            repository.uninstallApp(appId)
        }
    }
}
