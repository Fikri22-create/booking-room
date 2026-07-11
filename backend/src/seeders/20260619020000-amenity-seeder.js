module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('amenities', [
            { name: 'WiFi', icon: 'wifi', category: 'basic', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Air Conditioning', icon: 'wind', category: 'comfort', createdAt: new Date(), updatedAt: new Date() },
            { name: 'TV', icon: 'tv', category: 'entertainment', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Mini Bar', icon: 'coffee', category: 'food', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Safe Box', icon: 'lock', category: 'safety', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Shower', icon: 'droplet', category: 'bathroom', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Bathtub', icon: 'bath', category: 'bathroom', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Hair Dryer', icon: 'wind', category: 'bathroom', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Telephone', icon: 'phone', category: 'basic', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Work Desk', icon: 'briefcase', category: 'comfort', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Iron & Board', icon: 'shirt', category: 'comfort', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Room Service', icon: 'bell', category: 'food', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Minibar Fridge', icon: 'refrigerator', category: 'food', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Coffee Maker', icon: 'coffee', category: 'food', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Balcony', icon: 'home', category: 'comfort', createdAt: new Date(), updatedAt: new Date() },
            { name: 'City View', icon: 'eye', category: 'comfort', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Smoke Detector', icon: 'alert-triangle', category: 'safety', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Fire Extinguisher', icon: 'shield', category: 'safety', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Netflix', icon: 'tv', category: 'entertainment', createdAt: new Date(), updatedAt: new Date() },
            { name: 'Bluetooth Speaker', icon: 'speaker', category: 'entertainment', createdAt: new Date(), updatedAt: new Date() }
        ])
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('amenities', null, {})
    }
}
