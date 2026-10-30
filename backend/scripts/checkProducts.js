import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const totalProducts = await Product.countDocuments();
        console.log(`\n📦 Total products in database: ${totalProducts}`);

        const oilProducts = await Product.find({
            name: { $regex: 'oil', $options: 'i' }
        }).select('name category price');

        console.log(`\n🔍 Products matching "oil": ${oilProducts.length}`);
        oilProducts.forEach(p => {
            console.log(`  - ${p.name} (${p.category}) - ₹${p.price}`);
        });

        const allProducts = await Product.find().limit(10).select('name category');
        console.log(`\n📋 First 10 products:`);
        allProducts.forEach(p => {
            console.log(`  - ${p.name} (${p.category})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkProducts();
