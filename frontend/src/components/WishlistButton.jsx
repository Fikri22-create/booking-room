import { useState, useEffect, useContext } from 'react'
import { Heart } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { toggleWishlist, checkWishlistStatus } from '../services/wishlistService'
import { toast } from './Toast'

export default function WishlistButton({ roomId, size = 20, className = "" }) {
    const { user } = useContext(AuthContext)
    const [inWishlist, setInWishlist] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await checkWishlistStatus(roomId)
                setInWishlist(response.inWishlist)
            } catch (error) {
                console.error('Failed to check wishlist status:', error)
            }
        }

        if (user && roomId) {
            checkStatus()
        }
    }, [user, roomId])

    const handleToggle = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!user) {
            toast.error('Please login to add to wishlist')
            return
        }

        try {
            setLoading(true)
            const response = await toggleWishlist(roomId)
            setInWishlist(response.inWishlist)
            toast.success(response.message)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update wishlist')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`p-2 rounded-full transition-all duration-200 ${
                inWishlist 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-white/80 hover:bg-white text-slate-600 hover:text-red-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart 
                size={size} 
                className={`transition-all duration-200 ${
                    inWishlist ? 'fill-current' : ''
                } ${loading ? 'animate-pulse' : ''}`}
            />
        </button>
    )
}