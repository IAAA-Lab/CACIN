import React, { useState, useEffect, useMemo } from 'react';
import { Table, Form } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import { getOffices } from '../services/OfficeServices';
import i18 from '../i18n/i18';
import PaginationComponent from './PaginationComponent';
import FiltrosOfficeDropdown from './FiltrosOfficeDropdown';

function OfficeTable({ officesPage, onSelectOffice }) {
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [offices, setOffices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [officesPerPage, setOfficesPerPage] = useState(officesPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    foundedYear: '',
    closedYear: ''
  });

  useEffect(() => {
    let mounted = true;
    getOffices().then(data => {
      if (mounted) {
        setOffices(data);
      }
    });
    return () => mounted = false;
  }, []);

  // Extraer opciones únicas para filtros
  const locationOptions = useMemo(() => {
    const locations = Array.from(new Set(offices.map((office) => office.location).filter(Boolean)));
    return locations.map((location) => ({ value: location, label: location }));
  }, [offices]);

  const foundedYearOptions = useMemo(() => {
    const years = Array.from(new Set(offices.map((office) => office.foundedYear).filter(Boolean)));
    return years.map((year) => ({ value: year, label: year.toString() }));
  }, [offices]);

  const closedYearOptions = useMemo(() => {
    const years = Array.from(new Set(offices.map((office) => office.closedYear).filter(Boolean)));
    return years.map((year) => ({ value: year, label: year.toString() }));
  }, [offices]);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredOffices = useMemo(() => {
    return offices.filter((office) => {
      const matchLocation = !filters.location || office.location === filters.location;
      const matchFoundedYear = !filters.foundedYear || office.foundedYear?.toString() === filters.foundedYear;
      const matchClosedYear = !filters.closedYear || office.closedYear?.toString() === filters.closedYear;
      const matchSearch = !searchTerm || office.officeName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchLocation && matchFoundedYear && matchClosedYear && matchSearch;
    });
  }, [offices, filters, searchTerm]);

  const sortedOffices = useMemo(() => {
    return filteredOffices.sort((a, b) => {
      const getValue = (obj, key) => (obj[key] === null || obj[key] === undefined) ? '' : obj[key];

      if (sortColumn === "id") {
        const aValue = getValue(a, sortColumn);
        const bValue = getValue(b, sortColumn);
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        const aValue = getValue(a, sortColumn).toString().toLowerCase();
        const bValue = getValue(b, sortColumn).toString().toLowerCase();
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
    });
  }, [filteredOffices, sortColumn, sortDirection]);

  const indexOfLastOffice = currentPage * officesPerPage;
  const indexOfFirstOffice = indexOfLastOffice - officesPerPage;
  const currentOffices = sortedOffices.slice(indexOfFirstOffice, indexOfLastOffice);

  const totalPages = Math.ceil(filteredOffices.length / officesPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleOfficesPerPageChange = (e) => {
    setOfficesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleApplyFilters = (selectedFilters) => {
    setFilters(selectedFilters);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <Form className="d-flex">
          <FiSearch color="#985729" size="1.5em" className="mt-1" />
          <Form.Control
            type="search"
            placeholder={i18.t("printingOffice.placeholderTable")}
            className="ml-2"
            aria-label="Search"
            onChange={handleSearchChange}
          />
        </Form>
      </div>
      <FiltrosOfficeDropdown
        onApplyFilters={handleApplyFilters}
        locationOptions={locationOptions}
        foundedYearOptions={foundedYearOptions}
        closedYearOptions={closedYearOptions}
      />
      <div className="table w-full">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="cursor-pointer" onClick={() => handleSort("id")}>
                {i18.t("printingOffice.id")}
                {sortColumn === "id" && (sortDirection === "asc" ? " ↑" : " ↓")}
              </th>
              <th className="cursor-pointer" onClick={() => handleSort("officeName")}>
                {i18.t("printingOffice.name")}
                {sortColumn === "officeName" && (sortDirection === "asc" ? " ↑" : " ↓")}
              </th>
              <th className="cursor-pointer" onClick={() => handleSort("alternativeName")}>
                {i18.t("printingOffice.alternativeName")}
                {sortColumn === "alternativeName" && (sortDirection === "asc" ? " ↑" : " ↓")}
              </th>
              <th className="cursor-pointer" onClick={() => handleSort("foundedYear")}>
                {i18.t("printingOffice.foundedYear")}
                {sortColumn === "foundedYear" && (sortDirection === "asc" ? " ↑" : " ↓")}
              </th>
              <th className="cursor-pointer" onClick={() => handleSort("closedYear")}>
                {i18.t("printingOffice.closedYear")}
                {sortColumn === "closedYear" && (sortDirection === "asc" ? " ↑" : " ↓")}
              </th>
              <th className="cursor-pointer" onClick={() => handleSort("location")}>
                {i18.t("printingOffice.location")}
                {sortColumn === "location" && (sortDirection === "asc" ? " ↑" : " ↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentOffices.map((office, index) => (
              <tr
                key={index}
                onClick={() => onSelectOffice(office)}
                style={{ cursor: 'pointer' }}
              >
                <td>{office.id}</td>
                <td>{office.officeName}</td>
                <td>{office.alternativeName}</td>
                <td>{office.foundedYear}</td>
                <td>{office.closedYear}</td>
                <td>{office.location}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <span>{i18.t("booksTable.show")}</span>
          <select
            id="officesPerPage"
            value={officesPerPage}
            onChange={handleOfficesPerPageChange}
            className="p-1 rounded bg-#e7e2e2 text-black"
          >
            <option value={officesPage}>{officesPage}</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          handleClick={handlePageClick}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default OfficeTable;
