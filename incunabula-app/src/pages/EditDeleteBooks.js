import React from 'react'
import EditDeleteComponent from '../components/EditDeleteComponent'
import i18 from '../i18n/i18'
import { Helmet } from 'react-helmet'

function EditDeleteBooks() {
  return (
    <div>
      <Helmet>
        <title>{i18.t("NavBar.editDelete")}</title>
      </Helmet>

      <div className="container pt-4 mb-4 text-3xl font-semibold border-bottom">
        <h1>
          {i18.t("NavBar.editDelete")}
        </h1>
        <p>{i18.t("editDelete.info")}</p>
      </div>

      <EditDeleteComponent />

    </div>
  )
}

export default EditDeleteBooks
