import React from 'react'
import AddBookComponent from '../components/AddBookComponent'
import i18 from '../i18n/i18'
import { useState } from 'react'
import { Helmet } from 'react-helmet'

function AddBook() {

  const [isUpdated, setIsUpdated] = useState(false);

  return (
    <div>
      <Helmet>
        <title>{i18.t("add.title")}</title>
      </Helmet>

      <div className="container pt-4 mb-4 text-3xl font-semibold  border-bottom">
       <div className="text-3xl font-semibold">
          <h1>{i18.t("add.title")}</h1>
          <p>{i18.t("add.info")} </p>
        </div>
      </div>

      <AddBookComponent/>
    </div>
  )
}

export default AddBook
