import React from 'react'
import { getOfficeById } from '../services/OfficeServices';
import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import i18 from '../i18n/i18';
import { Helmet } from 'react-helmet';
import OfficeInfoComponent from '../components/OfficeInfoComponent';

function InfoOffice() {
  const [, params] = useRoute(`${i18.language === 'es' ? '/es' : '/en'}/office/:id`);
  const { id } = params;
  const [office, setOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const fetchedOffice = await getOfficeById(id);
        setOffice(fetchedOffice);
        console.log('fetchedOffice', fetchedOffice);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffice();
  }, [id]);

  if (loading) return null;
  if (error) return null;

  return (
    <div>
      <Helmet>
        <title>{office.officeName}</title>
      </Helmet>

      <div className="container pt-4 mb-4 text-3xl font-semibold  border-bottom">
        <h1>
          {office.officeName}
        </h1>
        <p>{i18.t("printingOffice.title")}</p>
      </div>

      <OfficeInfoComponent office={office} />



    </div>
  )
}

export default InfoOffice
