package com.superapp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.superapp.data.model.AppInfo
import com.superapp.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MarketViewModel @Inject constructor(
    private val repository: AppRepository
) : ViewModel() {
    private val _apps = MutableStateFlow<List<AppInfo>>(emptyList())
    val apps: StateFlow<List<AppInfo>> = _apps.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()

    init {
        loadApps()
    }

    fun loadApps() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            repository.getMarketApps(
                category = _selectedCategory.value
            ).fold(
                onSuccess = { _apps.value = it },
                onFailure = { _error.value = it.message }
            )

            _isLoading.value = false
        }
    }

    fun filterByCategory(category: String?) {
        _selectedCategory.value = category
        loadApps()
    }

    fun searchApps(query: String) {
        if (query.isBlank()) {
            loadApps()
            return
        }

        viewModelScope.launch {
            _isLoading.value = true
            repository.getMarketApps(search = query).fold(
                onSuccess = { _apps.value = it },
                onFailure = { _error.value = it.message }
            )
            _isLoading.value = false
        }
    }

    fun refresh() {
        loadApps()
    }
}
