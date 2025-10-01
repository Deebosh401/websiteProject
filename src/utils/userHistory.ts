export interface UserHistory {
  lastCategory?: string
  lastFilters?: Record<string, any>
  lastSearchQuery?: string
  lastPage?: string
  lastScrollPosition?: number
  lastVisitTime?: number
  visitedCategories: string[]
  filterHistory: Record<string, any>[]
}

class UserHistoryManager {
  private readonly STORAGE_KEY = 'userHistory'
  private readonly MAX_HISTORY_SIZE = 50

  private getHistory(): UserHistory {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load user history:', error)
    }
    
    return {
      visitedCategories: [],
      filterHistory: []
    }
  }

  private saveHistory(history: UserHistory): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
      console.warn('Failed to save user history:', error)
    }
  }

  // Save last visited category
  saveLastCategory(category: string): void {
    const history = this.getHistory()
    history.lastCategory = category
    history.lastVisitTime = Date.now()
    
    // Add to visited categories if not already there
    if (!history.visitedCategories.includes(category)) {
      history.visitedCategories.unshift(category)
      // Keep only recent categories
      history.visitedCategories = history.visitedCategories.slice(0, this.MAX_HISTORY_SIZE)
    }
    
    this.saveHistory(history)
  }

  // Get last visited category
  getLastCategory(): string | undefined {
    return this.getHistory().lastCategory
  }

  // Save applied filters for a category
  saveFilters(category: string, filters: Record<string, any>): void {
    const history = this.getHistory()
    history.lastFilters = filters
    history.lastCategory = category
    
    // Add to filter history
    const filterEntry = {
      category,
      filters,
      timestamp: Date.now()
    }
    
    history.filterHistory.unshift(filterEntry)
    // Keep only recent filter history
    history.filterHistory = history.filterHistory.slice(0, this.MAX_HISTORY_SIZE)
    
    this.saveHistory(history)
  }

  // Get last applied filters for a category
  getLastFilters(category?: string): Record<string, any> | undefined {
    const history = this.getHistory()
    
    if (category) {
      // Find filters for specific category
      const categoryFilters = history.filterHistory.find(entry => entry.category === category)
      return categoryFilters?.filters
    }
    
    return history.lastFilters
  }

  // Save search query
  saveSearchQuery(query: string): void {
    const history = this.getHistory()
    history.lastSearchQuery = query
    history.lastVisitTime = Date.now()
    this.saveHistory(history)
  }

  // Get last search query
  getLastSearchQuery(): string | undefined {
    return this.getHistory().lastSearchQuery
  }

  // Save current page
  saveLastPage(page: string): void {
    const history = this.getHistory()
    history.lastPage = page
    history.lastVisitTime = Date.now()
    this.saveHistory(history)
  }

  // Get last visited page
  getLastPage(): string | undefined {
    return this.getHistory().lastPage
  }

  // Save scroll position
  saveScrollPosition(position: number): void {
    const history = this.getHistory()
    history.lastScrollPosition = position
    this.saveHistory(history)
  }

  // Get last scroll position
  getLastScrollPosition(): number | undefined {
    return this.getHistory().lastScrollPosition
  }

  // Get recently visited categories
  getRecentCategories(): string[] {
    return this.getHistory().visitedCategories
  }

  // Get filter history for a category
  getFilterHistory(category: string): Record<string, any>[] {
    const history = this.getHistory()
    return history.filterHistory
      .filter(entry => entry.category === category)
      .map(entry => entry.filters)
  }

  // Clear history for a specific category
  clearCategoryHistory(category: string): void {
    const history = this.getHistory()
    history.visitedCategories = history.visitedCategories.filter(cat => cat !== category)
    history.filterHistory = history.filterHistory.filter(entry => entry.category !== category)
    
    if (history.lastCategory === category) {
      history.lastCategory = undefined
      history.lastFilters = undefined
    }
    
    this.saveHistory(history)
  }

  // Clear all history
  clearAllHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // Get history statistics
  getHistoryStats(): {
    totalCategories: number
    totalFilters: number
    lastVisit: number | undefined
  } {
    const history = this.getHistory()
    return {
      totalCategories: history.visitedCategories.length,
      totalFilters: history.filterHistory.length,
      lastVisit: history.lastVisitTime
    }
  }
}

// Export singleton instance
export const userHistory = new UserHistoryManager()

