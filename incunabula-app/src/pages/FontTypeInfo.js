import React from 'react';
import i18 from "../i18n/i18";
import { useRoute } from 'wouter';
import './EditBooks.css';
import FontInfoComponent from '../components/FontInfoComponent';
import { Helmet } from 'react-helmet';

const FontTypeInfo = () => {
  const [, params] = useRoute(`${i18.language === 'es' ? '/es' : '/en'}/fontType/:fontId`);
  const { fontId } = params;
  

  return (
    <div>
      <Helmet>
        <title>{fontId.toUpperCase()}</title>
      </Helmet>
      <style type="text/css">
        {`
          .btn-orange {
            background-color: #ECB289;
            color: black;
            border: 1px solid;
            border-radius: 5px;
          }
          .title-text {
            width: 80%;
            font-size: 2rem;
            font-weight: bold;
          }
          .edit-button {
            width: 20%;
            margin: 2rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
          }
        `}
      </style>

      <div className="container pt-4 mb-4 text-3xl font-semibold  border-bottom">
        <div className="text-3xl font-semibold">
          <div className="title-text">
            <h1>{fontId.toUpperCase()}</h1>
          </div>
          <p>{i18.t("font.info")}</p>
        </div>
        
      </div>

      <FontInfoComponent fontId={fontId} />

    </div>
  );
};

export default FontTypeInfo;
