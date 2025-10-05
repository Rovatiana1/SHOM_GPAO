import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../shared/Dropdown";

const ProcessDropdown: React.FC = () => {
  const { t } = useTranslation();

  // Valeur sélectionnée (par défaut "CQ")
  const [selected, setSelected] = useState<string>("CQ");

  return (
    <Dropdown
      button={
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-auto h-8 px-4 rounded-lg bg-red-100 flex items-center justify-center text-sm font-semibold text-red-700">
            {selected}
          </div>
        </div>
      }
      width="8rem"
      className="rounded-lg"
      showIcon
    >
      <button
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition rounded"
        onClick={() => setSelected("CQ")}
      >
        CQ
      </button>
      <button
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition rounded"
        onClick={() => setSelected("CQ_ISO")}
      >
        CQ_ISO
      </button>
    </Dropdown>
  );
};

export default ProcessDropdown;
