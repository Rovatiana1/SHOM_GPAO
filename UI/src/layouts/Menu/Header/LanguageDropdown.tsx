import React from "react";
import { FaGlobe } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../../shared/Dropdown";

const LanguageDropdown: React.FC = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language ?? "en";

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("app_language", lng);
  };

  return (
    <Dropdown
      button={
        <div className="flex items-center gap-2 text-gray-700">
          <FaGlobe className="text-green-500" />
          <span className="font-medium">{currentLang.toUpperCase()}</span>
        </div>
      }
      width="8rem"
      className="rounded-lg"
      showIcon
    >
      {[
        { code: "en", name: t('header.english') },
        { code: "fr", name: t('header.french') },
      ].map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition rounded"
        >
          {lang.name}
        </button>
      ))}
    </Dropdown>
  );
};

export default LanguageDropdown;
