import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import type {Product} from '../../types/product.types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import { Loader2, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

export const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { toast } = useToast();

    useEffect(() => {
        if (slug) {
            loadProduct();
        }
    }, [slug]);

    const loadProduct = async () => {
        try {
            const data = await productService.getProductBySlug(slug!);
            setProduct(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load product.'+ error,
                variant: 'destructive',
            });
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        // TODO: Implement cart functionality
        toast({
            title: 'Added to cart',
            description: `${quantity} x ${product?.name} has been added to your cart`,
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product?.name,
                text: product?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: 'Link copied',
                description: 'Product link has been copied to clipboard',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!product) {
        return null;
    }

    const vendor = typeof product.vendor === 'object' ? product.vendor : null;
    const category = typeof product.category === 'object' ? product.category : null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const discount = product.compareAtPrice
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/products')}
                className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to products
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                            src={product.images[selectedImage] || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {product.images.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                                        selectedImage === index ? 'border-primary' : 'border-gray-200'
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        {vendor && (
                            <p className="text-gray-600 mt-1">
                                by {vendor.profile.firstName} {vendor.profile.lastName}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`h-5 w-5 ${
                                        i < Math.floor(product.ratings.average)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="ml-2 text-gray-600">
                {product.ratings.average} ({product.ratings.count} reviews)
              </span>
                        </div>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-600">{product.views} views</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                            {product.compareAtPrice && (
                                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                                    <Badge variant="destructive">{discount}% OFF</Badge>
                                </>
                            )}
                        </div>

                        {category && (
                            <p className="text-sm text-gray-600">
                                Category: <span className="font-medium">{category.name}</span>
                            </p>
                        )}

                        {product.brand && (
                            <p className="text-sm text-gray-600">
                                Brand: <span className="font-medium">{product.brand}</span>
                            </p>
                        )}
                    </div>

                    <div className="prose max-w-none">
                        <p>{product.description}</p>
                    </div>

                    {/* Stock Status */}
                    <div>
                        {product.trackQuantity ? (
                            product.quantity > 0 ? (
                                <p className="text-green-600 font-medium">
                                    ✓ In Stock ({product.quantity} available)
                                </p>
                            ) : product.allowBackorder ? (
                                <p className="text-yellow-600 font-medium">
                                    Available on backorder
                                </p>
                            ) : (
                                <p className="text-red-600 font-medium">Out of Stock</p>
                            )
                        ) : (
                            <p className="text-green-600 font-medium">✓ In Stock</p>
                        )}
                    </div>

                    {/* Add to Cart */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Label>Quantity:</Label>
                            <div className="flex items-center border rounded-md">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 hover:bg-gray-100"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.trackQuantity ? product.quantity : undefined}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="w-16 text-center border-x"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-2 hover:bg-gray-100"
                                    disabled={product.trackQuantity && quantity >= product.quantity}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <Button
                                size="lg"
                                className="flex-1"
                                onClick={handleAddToCart}
                                disabled={
                                    product.trackQuantity &&
                                    product.quantity === 0 &&
                                    !product.allowBackorder
                                }
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Add to Cart
                            </Button>
                            <Button size="lg" variant="outline">
                                <Heart className="h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" onClick={handleShare}>
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Product Details */}
                    {(product.specifications && Object.keys(product.specifications).length > 0) && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                            <dl className="space-y-2">
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    <div key={key} className="flex">
                                        <dt className="font-medium w-1/3">{key}:</dt>
                                        <dd className="text-gray-600 w-2/3">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    {/* Tags */}
                    {product.tags.length > 0 && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};