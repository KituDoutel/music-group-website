import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../features/cartSlice';
import axios from 'axios';

const Checkout = () => {
  const { items, total } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  
  const handleCheckout = async () => {
    try {
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { data } = await axios.post('/api/orders', {
        items: orderItems,
        total
      });
      
      // Redirect ke payment gateway
      window.location = data.payment_url;
      dispatch(clearCart());
      
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <div className="mb-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between mb-2">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2 mb-4">
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${total}</span>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Proceed to Payment
      </button>
    </div>
  );
};

export default Checkout;