import React, { useState, useEffect } from 'react';
import { postPizza } from '../../backend/helpers.js';

const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

const sizeMap = {
  'S': 'small',
  'M': 'medium',
  'L': 'large',
};

const Form = ({ orderSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    size: '',
    toppings: [],
  });
  const [showOrderMessage, setShowOrderMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isFullNameValid, setIsFullNameValid] = useState(false);
  const [isSizeValid, setIsSizeValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData.fullName, formData.size]);

  const validateForm = () => {
    const newErrors = {};
    const trimmedName = formData.fullName.trim();

    // Validation for fullName
    newErrors.fullName = trimmedName.length < 3 ? 'full name must be at least 3 characters' : '';
    setIsFullNameValid(newErrors.fullName === '');
  
    // Validation for size
    newErrors.size = !['S', 'M', 'L'].includes(formData.size) ? 'Size must be S or M or L' : '';
    setIsSizeValid(newErrors.size === '');
  
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateForm();

    if (!isFullNameValid || !isSizeValid) {
      console.error('Form validation failed:', errors);
      return;
    }

    const response = await postPizza(formData);
    if (response.status === 201) {
      const sizeText = sizeMap[formData.size];
      const toppingCount = formData.toppings.length;
      const toppingText = toppingCount === 0 ? 'with no toppings' : `with ${toppingCount} topping${toppingCount > 1 ? 's' : ''}`;
      
      setShowOrderMessage(`Thank you for your order, ${formData.fullName}! Your ${sizeText} pizza ${toppingText} is on the way.`);
      setFormData({ fullName: '', size: '', toppings: [] });
      setIsFullNameValid(false);
      setIsSizeValid(false);

      if (orderSuccess) {
        orderSuccess(formData.fullName);
      }
    } else {
      setShowOrderMessage(`Error placing the order: ${response.data.message}`);
      console.error('Error placing the order:', response.data.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (toppingId) => {
    setFormData((prevData) => {
      const updatedToppings = prevData.toppings.includes(toppingId)
        ? prevData.toppings.filter((t) => t !== toppingId)
        : [...prevData.toppings, toppingId];

      return { ...prevData, toppings: updatedToppings };
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {showOrderMessage && <div className="success">{showOrderMessage}</div>}

      <div className="input-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Type full name"
          value={formData.fullName}
          onChange={handleInputChange}
        />
        {errors.fullName && <div className="error">{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <label htmlFor="size">Size</label>
        <select
          id="size"
          name="size"
          value={formData.size}
          onChange={handleInputChange}
        >
          <option value="">----Choose Size----</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
        </select>
        {errors.size && <div className="error">{errors.size}</div>}
      </div>

      <div className="input-group">
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input
              name="toppings"
              type="checkbox"
              checked={formData.toppings.includes(topping.topping_id)}
              onChange={() => handleCheckboxChange(topping.topping_id)}
            />
            {topping.text}
          </label>
        ))}
      </div>

      <input type="submit" disabled={!isFullNameValid || !isSizeValid} />
    </form>
  );
};

export default Form;