import React from 'react'
import BooksTable from '../components/BooksTable'
import i18 from '../i18n/i18'
import { Helmet } from 'react-helmet'

function ListBooks() {
  return (
    <div>
      <Helmet>
        <title>{i18.t("NavBar.booksList")}</title>
      </Helmet>
      <div className="container pt-4 mb-4 text-3xl font-semibold  border-bottom">
        <h1>
          {i18.t("NavBar.booksList")}
        </h1>
        <p>{i18.t("booksTable.info")}</p>
      </div>

      <BooksTable />

    </div>
  )
}

export default ListBooks
