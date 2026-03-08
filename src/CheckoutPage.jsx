import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://snapcharge.onrender.com";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const buyNowItem = useMemo(() => {
    const saved = localStorage.getItem("snapcharge_buy_now");
    return saved ? JSON.parse(saved) : null;
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "COD",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      alert("Please fill all fields");
      return false;
    }

    if (!buyNowItem) {
      alert("No product selected for order.");
      return false;
    }

    return true;
  };

  const saveLocalOrderAndRedirect = (extra = {}) => {
    const orderData = {
      orderId: `SC${Date.now()}`,
      customer: formData,
      item: buyNowItem,
      total: buyNowItem.price * (buyNowItem.quantity || 1),
      createdAt: new Date().toISOString(),
      ...extra,
    };

    localStorage.setItem("snapcharge_last_order", JSON.stringify(orderData));
    localStorage.removeItem("snapcharge_buy_now");
    navigate("/order-success");
  };

  const handleCODOrder = () => {
    saveLocalOrderAndRedirect({
      paymentStatus: "COD_PENDING",
      paymentMethod: "COD",
    });
  };

  const handleOnlinePayment = async () => {
    try {
      setLoading(true);

      const amount = buyNowItem.price * (buyNowItem.quantity || 1);

      const payload = {
        customerName: formData.fullName,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        productName: buyNowItem.name,
        productId: buyNowItem.id || buyNowItem._id || "",
        variant: buyNowItem.variant || buyNowItem.selectedVariant || "Default",
        quantity: buyNowItem.quantity || 1,
        amount,
      };

      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert(orderData.message || "Failed to create payment order");
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SnapCharge",
        description: buyNowItem.name,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payment/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                dbOrderId: orderData.dbOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              saveLocalOrderAndRedirect({
                paymentStatus: "PAID",
                paymentMethod: "ONLINE",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              });
            } else {
              alert("Payment verification failed");
            }
          } catch (error) {
            console.log("Verification error:", error);
            alert("Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
          product: buyNowItem.name,
        },
        theme: {
          color: "#9DC183",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log("Payment error:", error);
      alert("Something went wrong while initiating payment");
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (formData.paymentMethod === "COD") {
      handleCODOrder();
    } else {
      await handleOnlinePayment();
    }
  };

  if (!buyNowItem) {
    return (
      <div className="min-h-screen bg-[#FAEBD7] pt-32 px-4 sm:px-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#436056] mb-3">
            No product selected
          </h2>
          <p className="text-gray-600 mb-5">
            Please use the Book Now button from a product page.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#9DC183] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#436056] transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const total = buyNowItem.price * (buyNowItem.quantity || 1);

  return (
    <div className="min-h-screen bg-[#FAEBD7] pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.3fr,0.8fr] gap-8">
        <div className="bg-white rounded-3xl shadow p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-[#436056] mb-6">Checkout</h1>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-[#ddd] rounded-xl px-4 py-3 outline-none focus:border-[#9DC183]"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-[#ddd] rounded-xl px-4 py-3 outline-none focus:border-[#9DC183]"
            />

            <textarea
              name="address"
              placeholder="Full Address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              className="w-full border border-[#ddd] rounded-xl px-4 py-3 outline-none focus:border-[#9DC183]"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-[#ddd] rounded-xl px-4 py-3 outline-none focus:border-[#9DC183]"
              />

              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className="w-full border border-[#ddd] rounded-xl px-4 py-3 outline-none focus:border-[#9DC183]"
              />
            </div>

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full border border-[#ddd] rounded-xl px-4 py-3 outline-none focus:border-[#9DC183]"
            />

            <div>
              <p className="text-sm font-semibold text-[#436056] mb-2">
                Payment Method
              </p>

              <div className="flex flex-col gap-2 text-sm text-[#436056]">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                  />
                  Cash on Delivery
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={formData.paymentMethod === "Online"}
                    onChange={handleChange}
                  />
                  Online Payment
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#9DC183] text-white py-3 rounded-full font-semibold hover:bg-[#436056] transition disabled:opacity-60"
            >
              {loading
                ? "Processing..."
                : formData.paymentMethod === "Online"
                ? `Pay Now ₹${total}`
                : "Place Order"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 h-fit">
          <h2 className="text-2xl font-bold text-[#436056] mb-5">
            Order Summary
          </h2>

          <div className="flex gap-3 border-b pb-4">
            <img
              src={buyNowItem.image}
              alt={buyNowItem.name}
              className="w-20 h-20 object-contain rounded-lg bg-[#f8f8f8]"
            />

            <div className="flex-1">
              <p className="font-semibold text-[#436056] text-sm">
                {buyNowItem.name}
              </p>

              {buyNowItem.subtitle && (
                <p className="text-xs text-gray-500 mt-1">
                  {buyNowItem.subtitle}
                </p>
              )}

              {buyNowItem.variant && (
                <p className="text-xs text-gray-500 mt-1">
                  Variant: {buyNowItem.variant}
                </p>
              )}

              <p className="text-sm text-gray-600 mt-2">
                Qty: {buyNowItem.quantity || 1}
              </p>

              <p className="text-sm font-semibold text-[#436056] mt-1">
                ₹{buyNowItem.price}
              </p>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t">
            <div className="flex justify-between text-lg font-bold text-[#436056]">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;