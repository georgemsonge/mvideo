"use client"

import { Home, Search, Plus, Heart, User } from "lucide-react"

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 z-50">
      <ul className="flex items-center justify-around p-4">
        <li>
          <a href="#" className="text-gray-500 hover:text-white">
            <Home className="h-6 w-6" />
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-500 hover:text-white">
            <Search className="h-6 w-6" />
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-500 hover:text-white">
            <Plus className="h-6 w-6" />
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-500 hover:text-white">
            <Heart className="h-6 w-6" />
          </a>
        </li>
        <li>
          <a href="#" className="text-gray-500 hover:text-white">
            <User className="h-6 w-6" />
          </a>
        </li>
      </ul>
    </nav>
  )
}
