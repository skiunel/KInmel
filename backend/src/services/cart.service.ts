import { Cart, ICart } from '../models/Cart';
import { Product } from '../models/Product';
import { ApiError } from '../utils/api-error';
import { CART, TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '../config/constants';
import type { AddToCartInput, UpdateCartItemInput } from '../validators/cart.validators';

// ─── Response Shape ───

interface CartResponse {
  _id: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      slug: string;
      price: number;
      compareAtPrice: number | null;
      images: string[];
      stock: number;
    };
    quantity: number;
    price: number;
    lineTotal: number;
  }>;
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
}

// ─── Helpers ───

const populateCart = async (cart: ICart): Promise<CartResponse> => {
  const populated = await cart.populate({
    path: 'items.product',
    select: 'name slug price compareAtPrice images stock isActive',
  });

  // Filter out products that no longer exist or are inactive
  const validItems = populated.items.filter((item) => {
    const product = item.product as unknown as Record<string, unknown>;
    return product && product.isActive;
  });

  const items = validItems.map((item) => {
    const product = item.product as unknown as {
      _id: string;
      name: string;
      slug: string;
      price: number;
      compareAtPrice: number | null;
      images: string[];
      stock: number;
    };
    return {
      product: {
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: product.images,
        stock: product.stock,
      },
      quantity: item.quantity,
      price: product.price, // always use current price
      lineTotal: product.price * item.quantity,
    };
  });

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const totalAmount = subtotal + shippingCost + taxAmount;

  return {
    _id: cart._id.toString(),
    items,
    itemCount,
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
  };
};

// ─── Get or Create Cart ───

const getOrCreateCart = async (userId: string): Promise<ICart> => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// ─── Get Cart ───

export const getCart = async (userId: string): Promise<CartResponse> => {
  const cart = await getOrCreateCart(userId);
  return populateCart(cart);
};

// ─── Add to Cart ───

export const addToCart = async (userId: string, input: AddToCartInput): Promise<CartResponse> => {
  const { productId, quantity } = input;

  // Validate product
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw ApiError.notFound('Product not found or unavailable');
  }
  if (product.stock < quantity) {
    throw ApiError.badRequest(
      `Only ${product.stock} unit(s) of "${product.name}" available`
    );
  }

  const cart = await getOrCreateCart(userId);

  // Check if product already in cart
  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingIndex >= 0) {
    const newQty = cart.items[existingIndex].quantity + quantity;
    if (newQty > CART.MAX_QUANTITY_PER_ITEM) {
      throw ApiError.badRequest(
        `Maximum ${CART.MAX_QUANTITY_PER_ITEM} units per item`
      );
    }
    if (newQty > product.stock) {
      throw ApiError.badRequest(
        `Only ${product.stock} unit(s) of "${product.name}" available`
      );
    }
    cart.items[existingIndex].quantity = newQty;
    cart.items[existingIndex].price = product.price;
  } else {
    if (cart.items.length >= CART.MAX_ITEMS) {
      throw ApiError.badRequest(`Cart cannot have more than ${CART.MAX_ITEMS} items`);
    }
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price,
    });
  }

  await cart.save();
  return populateCart(cart);
};

// ─── Update Item Quantity ───

export const updateItem = async (
  userId: string,
  productId: string,
  input: UpdateCartItemInput
): Promise<CartResponse> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (itemIndex < 0) {
    throw ApiError.notFound('Item not found in cart');
  }

  // Validate stock
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    // Remove invalid product from cart
    cart.items.splice(itemIndex, 1);
    await cart.save();
    throw ApiError.badRequest('Product is no longer available and has been removed from your cart');
  }

  if (input.quantity > product.stock) {
    throw ApiError.badRequest(
      `Only ${product.stock} unit(s) of "${product.name}" available`
    );
  }

  cart.items[itemIndex].quantity = input.quantity;
  cart.items[itemIndex].price = product.price;
  await cart.save();

  return populateCart(cart);
};

// ─── Remove Item ───

export const removeItem = async (userId: string, productId: string): Promise<CartResponse> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (itemIndex < 0) {
    throw ApiError.notFound('Item not found in cart');
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  return populateCart(cart);
};

// ─── Clear Cart ───

export const clearCart = async (userId: string): Promise<CartResponse> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  cart.items = [];
  await cart.save();

  return populateCart(cart);
};
