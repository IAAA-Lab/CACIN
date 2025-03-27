import React, { useState, useMemo, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import PaginationComponent from './PaginationComponent';
import { getBooks } from "../services/IncunabulaServices";
import i18 from "../i18n/i18";
import { FiSearch, FiEdit } from "react-icons/fi";
import DeleteIncunabulaModal from "./DeleteIncunabulaModal";
import { useLocation } from 'wouter';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FiltrosDropdown from "./FiltrosDropdown";

const EditDeleteComponent = () => {
  const [sortColumn, setSortColumn] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    creator: '',
    publisher: '',
    printingOffice: '',
    fontType: ''
  });

  const [, navigate] = useLocation();

  useEffect(() => {
    let mounted = true;
    getBooks().then(data => {
      if (mounted) {
        setBooks(data);
      }
    });
    return () => mounted = false;
  }, []);

  const creatorOptions = useMemo(() => {
    const creators = Array.from(new Set(books.map((book) => book.creator).filter(Boolean)));
    return creators.map((creator) => ({ value: creator, label: creator }));
  }, [books]);

  const publisherOptions = useMemo(() => {
    const publishers = Array.from(new Set(books.map((book) => book.publisher).filter(Boolean)));
    return publishers.map((publisher) => ({ value: publisher, label: publisher }));
  }, [books]);

  const fontTypeOptions = useMemo(() => {
    const fontTypes = Array.from(
      new Set(
        books.flatMap((book) => book.fontTypes?.map((font) => font.id)).filter(Boolean)
      )
    );
    return fontTypes.map((fontType) => ({ value: fontType, label: fontType }));
  }, [books]);

  const officeOptions = useMemo(() => {
    const offices = Array.from(new Set(books.map((book) => book.printingOffice?.id).filter(Boolean)));
    return offices.map((office) => ({ value: office, label: office }));
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchCreator = !filters.creator || book.creator === filters.creator;
      const matchPublisher = !filters.publisher || book.publisher === filters.publisher;
      const matchPrintingOffice = !filters.printingOffice || book.printingOffice?.id === filters.printingOffice;
      const matchFontType = !filters.fontType || book.fontTypes?.some((font) => font.id === filters.fontType);
      const matchSearch = !searchTerm || book.title?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCreator && matchPublisher && matchPrintingOffice && matchFontType && matchSearch;
    });
  }, [books, filters, searchTerm]);

  const handleApplyFilters = (appliedFilters) => {
    setFilters(appliedFilters);
    setCurrentPage(1); // Reiniciar la paginación al aplicar nuevos filtros
  };

  const handleUpdate = (e, book) => {
    e.preventDefault();
    navigate(`${i18.language === 'es' ? '/es' : '/en'}/edit/${book.id}`);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    navigate(`${i18.language === 'es' ? '/es' : '/en'}/add`);
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedBooks = useMemo(() => {
    return filteredBooks.sort((a, b) => {
      const getValue = (obj, key) => (obj[key] === null || obj[key] === undefined) ? '' : obj[key];

      if (sortColumn === "id") {
        const aValue = parseInt(getValue(a, sortColumn), 10);
        const bValue = parseInt(getValue(b, sortColumn), 10);
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        const aValue = getValue(a, sortColumn).toString().toLowerCase();
        const bValue = getValue(b, sortColumn).toString().toLowerCase();
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
    });
  }, [filteredBooks, sortColumn, sortDirection]);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleBooksPerPageChange = (e) => {
    setBooksPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleDeleteSuccess = id => {
    setBooks(books.filter(book => book.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <style type="text/css">
        {`
          .btn-orange {
            background-color: #ECB289;
            color: black;
            border: 1px solid;
            border-radius: 5px;
          }
        `}
      </style>

      <div className="mb-3 flex justify-between items-center">
        <Form className="d-flex">
          <FiSearch color="#985729" size="1.5em" className="mt-1" />
          <Form.Control
            type="search"
            placeholder={i18.t("booksTable.placeholderTable")}
            className="ml-2"
            aria-label="Search"
            onChange={handleSearchChange}
          />
        </Form>

        <Button variant="orange" onClick={(e) => handleAdd(e)}>
          {i18.t("booksTable.addBook")}
        </Button>
      </div>

      <FiltrosDropdown 
        onApplyFilters={handleApplyFilters} 
        creatorOptions={creatorOptions} 
        publisherOptions={publisherOptions} 
        fontTypeOptions={fontTypeOptions}
        officeOptions={officeOptions}
      />

      <div className="table">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={() => handleSort("id")}>
                {i18.t("booksTable.id")}
                {sortColumn === "id" && (
                  <span>{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </th>
              <th onClick={() => handleSort("title")}>
                {i18.t("booksTable.title")}
                {sortColumn === "title" && (
                  <span>{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </th>
              <th onClick={() => handleSort("creator")}>
                {i18.t("booksTable.creator")}
                {sortColumn === "creator" && (
                  <span>{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </th>
              <th onClick={() => handleSort("publisher")}>
                {i18.t("booksTable.publisher")}
                {sortColumn === "publisher" && (
                  <span>{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </th>
              <th onClick={() => handleSort("printingOffice")}>
                {i18.t("booksTable.printingOffice")}
                {sortColumn === "printingOffice" && (
                  <span>{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </th>
              <th>{i18.t("booksTable.fontType")}</th>
              <th>{i18.t("editDelete.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {currentBooks.map((book, index) => (
              <tr key={index}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.creator}</td>
                <td>{book.publisher}</td>
                <td>{book.printingOffice ? book.printingOffice.id : ''}</td>
                <td>
                  {Array.isArray(book.fontTypes) && book.fontTypes.map((font, index) => (
                    <p key={index}>{font.id}</p>
                  ))}
                </td>
                <td>
                  <div className="d-flex flex-wrap justify-content-center">
                    <Button
                      variant="orange"
                      onClick={(e) => handleUpdate(e, book)}
                    >
                      <FiEdit />
                    </Button>
                    <DeleteIncunabulaModal bookToDelete={book.id} onDeleteSuccess={handleDeleteSuccess} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <span>{i18.t("booksTable.show")}</span>
          <select value={booksPerPage} onChange={handleBooksPerPageChange}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          handleClick={handlePageClick}
        />
      </div>
    </div>
  );
};

export default EditDeleteComponent;
