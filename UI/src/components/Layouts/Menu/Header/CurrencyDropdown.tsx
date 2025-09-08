import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaDollarSign } from "react-icons/fa";
import Dropdown from "../../../../shared/Dropdown";

const CurrencyDropdown: React.FC = () => {
  const { t } = useTranslation();
  const currencies = [
    { code: "USD", symbol: "$", name: t('header.usd') },
    { code: "EUR", symbol: "€", name: t('header.eur') },
  ];

  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    localStorage.getItem("app_currency") || "USD"
  );

  useEffect(() => {
    localStorage.setItem("app_currency", selectedCurrency);
  }, [selectedCurrency]);

  const currentCurrency = currencies.find((c) => c.code === selectedCurrency);

  return (
    <Dropdown
      button={
        <div className="flex items-center gap-2 text-gray-700">
          <FaDollarSign className="text-indigo-500" />
          <span className="font-medium">{currentCurrency?.code}</span>
        </div>
      }
      width="10rem"
      className="rounded-lg"
      showIcon
    >
      {currencies.map((currency) => (
        <button
          key={currency.code}
          onClick={() => setSelectedCurrency(currency.code)}
          className="w-full px-4 py-2 flex justify-between text-sm text-gray-700 hover:bg-indigo-50 transition rounded"
        >
          <span>{currency.name}</span>
          <span className="font-semibold text-indigo-600">{currency.symbol}</span>
        </button>
      ))}
    </Dropdown>
  );
};

export default CurrencyDropdown;
