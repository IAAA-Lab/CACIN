import React from 'react';
import OfficeTable from '../components/OfficeTable';
import i18 from '../i18n/i18';
import { Helmet } from 'react-helmet';

function OfficeList() {
  const officesPage = 10;

  const handleOfficeSelect = (office) => {
    window.location.href = `${i18.language === 'es' ? '/es' : '/en'}/office/${office.id}`;
  };

  return (
    <div>
      <Helmet>
        <title>{i18.t("NavBar.office")}</title>
      </Helmet>

      <div className="container pt-4 mb-4 text-3xl font-semibold border-bottom">
        <h1>
          {i18.t("NavBar.office")}
        </h1>
        <p>{i18.t("printingOffice.title")}</p>
      </div>

      <OfficeTable officesPage={officesPage} onSelectOffice={handleOfficeSelect} />

    </div>
  );
}

export default OfficeList;
