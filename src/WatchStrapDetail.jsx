// src/WatchStrapDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getWatchStrapById,
  getRelatedWatchStraps,
} from "./watchStrapData";
import { useCart } from "./CartContext";

const WatchStrapDetail = () => {
  const params = useParams();
  const paramId = params.id || Object.values(params)[0];
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = getWatchStrapById(paramId);

  const variants = useMemo(() => {
    if (product?.variants?.length) return product.variants;
    return [
      {
        label: "38mm / 40mm / 41mm",
        price: product?.price ?? 699,
        mrp: product?.mrp ?? 1199,
      },
      {
        label: "42mm / 44mm / 45mm",
        price: product?.price ?? 699,
        mrp: product?.mrp ?? 1199,
      },
      {
        label: "Apple Watch Ultra",
        price: (product?.price ?? 699) + 100,
        mrp: (product?.mrp ?? 1199) + 100,
      },
    ];
  }, [product]);

  const [variantIndex, setVariantIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  const gallery = product?.images?.filter(Boolean) || [];
  const [selectedImage, setSelectedImage] = useState(gallery[0] || "");

  useEffect(() => {
    setSelectedImage(gallery[0] || "");
  }, [paramId]); // eslint-disable-line

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAEBD7] flex items-center justify-center px-4">
        <div className="bg-white px-8 py-6 rounded-2xl shadow-md text-center">
          <p className="text-lg font-semibold text-[#3f5c4a] mb-4">
            Product not found.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-full bg-[#7aa874] text-white text-sm font-medium hover:bg-[#6b9a65] transition"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const selectedVariant = variants[variantIndex] || variants[0];
  const related = getRelatedWatchStraps(product.id);
  const delivery = product.deliveryReturn || {};

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${selectedVariant.label}`,
      name: `${product.name} (${selectedVariant.label})`,
      price: selectedVariant.price,
      image: selectedImage || product.images?.[0],
      subtitle: product.details,
      variant: selectedVariant.label,
      quantity: 1,
    });
  };

  const handleBookNow = () => {
    const buyNowItem = {
      id: `${product.id}-${selectedVariant.label}`,
      name: `${product.name} (${selectedVariant.label})`,
      price: selectedVariant.price,
      image: selectedImage || product.images?.[0],
      subtitle: product.details,
      quantity: 1,
      variant: selectedVariant.label,
    };

    localStorage.setItem("snapcharge_buy_now", JSON.stringify(buyNowItem));
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#FAEBD7] pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow hover:shadow-md text-sm text-[#3f5c4a] font-medium"
        >
          <span>←</span> Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-[#f6ebdd] rounded-[32px] p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white rounded-3xl flex items-center justify-center h-[320px] sm:h-[380px] mb-5">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                Image Coming Soon
              </div>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {(gallery.length ? gallery : ["", "", ""]).map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => img && setSelectedImage(img)}
                className={`min-w-[70px] h-[80px] rounded-2xl border flex items-center justify-center bg-[#f8f4ee] transition ${
                  selectedImage === img
                    ? "border-[#3f5c4a]"
                    : "border-transparent hover:border-[#3f5c4a]"
                }`}
              >
                {img ? (
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="max-h-full max-w-full object-contain p-1"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400 px-1">Image</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2f4737] leading-snug">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-[#2f4737]">
              ₹{selectedVariant.price}
            </span>
            <span className="text-sm text-[#8b8b8b] line-through">
              ₹{selectedVariant.mrp}
            </span>
            <span className="text-[11px] text-[#9a9a9a]">
              MRP inclusive of all taxes
            </span>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-[#2f4737] mb-2">
              Select Size
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              {variants.map((v, i) => {
                const active = i === variantIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setVariantIndex(i)}
                    className={`px-4 py-2 rounded-full transition ${
                      active
                        ? "bg-black text-white"
                        : "bg-white border border-[#d4d4d4] text-[#2f4737] hover:bg-[#f8f4ee]"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-sm text-[#556659]">{product.details}</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#7aa874] hover:bg-[#6b9a65] text-white py-3 rounded-full font-semibold text-sm sm:text-base transition"
            >
              ADD TO CART
            </button>

            <button
              onClick={handleBookNow}
              className="flex-1 bg-white text-[#2f4737] border border-[#d9d9d9] hover:bg-[#f8f4ee] py-3 rounded-full font-semibold text-sm sm:text-base transition"
            >
              BOOK NOW
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_320px] gap-6 items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-10 border-b border-[#e7d9c2] text-sm font-semibold text-[#9aa3b2]">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 transition ${
                activeTab === "details"
                  ? "text-[#2f5a4d] border-b-2 border-[#7aa874]"
                  : "hover:text-[#2f5a4d]"
              }`}
            >
              Product Details
            </button>

            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 transition ${
                activeTab === "specs"
                  ? "text-[#2f5a4d] border-b-2 border-[#7aa874]"
                  : "hover:text-[#2f5a4d]"
              }`}
            >
              Specifications
            </button>

            <button
              onClick={() => setActiveTab("delivery")}
              className={`pb-4 transition ${
                activeTab === "delivery"
                  ? "text-[#2f5a4d] border-b-2 border-[#7aa874]"
                  : "hover:text-[#2f5a4d]"
              }`}
            >
              Delivery & Returns
            </button>
          </div>

          <div className="mt-5 bg-[#f8f8f8] rounded-[24px] shadow-sm border border-[#e8e1d4] px-6 py-7 text-[#4e5d56] min-h-[116px]">
            {activeTab === "details" && (
              <p className="text-[15px] leading-7">{product.details}</p>
            )}

            {activeTab === "specs" && (
              <ul className="list-disc list-inside space-y-2 text-[15px] leading-7">
                {product.specs.map((spec, i) => (
                  <li key={i}>{spec}</li>
                ))}
              </ul>
            )}

            {activeTab === "delivery" && (
              <div className="space-y-4 text-[15px] leading-7">
                <p>
                  <span className="font-semibold text-[#2f4737]">Delivery:</span>{" "}
                  {delivery.shipping}
                </p>
                <p>
                  <span className="font-semibold text-[#2f4737]">Returns:</span>{" "}
                  {delivery.returns}
                </p>
                <p>
                  <span className="font-semibold text-[#2f4737]">Care:</span>{" "}
                  {delivery.care}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-[#e8e1d4] px-6 py-6 text-sm text-[#56665a] h-fit self-start">
          <h3 className="font-semibold text-[#2f4737] mb-3">
            Why buy from SnapCharge?
          </h3>

          <ul className="list-disc list-inside space-y-2 leading-7">
            <li>Premium quality watch straps</li>
            <li>Secure packaging for safer delivery</li>
            <li>Support for order and tracking assistance</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <div className="max-w-6xl mx-auto mt-14">
          <h2 className="text-2xl font-bold text-[#2f5a4d] mb-6">
            Related Products
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/watch-straps/${item.id}`)}
                className="bg-white rounded-3xl p-4 cursor-pointer shadow hover:shadow-lg transition"
              >
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="h-40 mx-auto object-contain"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-xs text-gray-400">
                    Image
                  </div>
                )}

                <h3 className="mt-3 font-semibold text-[#2f4737]">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500">₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchStrapDetail;