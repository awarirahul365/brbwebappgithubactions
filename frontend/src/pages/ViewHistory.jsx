import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Label,
  Table,
  TableCell,
  TableColumn,
  TableRow,
  DatePicker
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableColumn.js";
import "@ui5/webcomponents/dist/TableCell.js";
import ReactPaginate from 'react-paginate';
import { Loadingcomponent } from './../Loading/Loadingcomponent';

const styles = {
  table: {
    height: "360px",
    marginRight: "16px",
    marginLeft: "16px",
    overflow: "scroll",
  },
};
const ViewHistory = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      //const response = await axios.get('https://brbtabledetails.azurewebsites.net/api/HttpTriggerbrbpoc?code=65HsxhIseUY3-gCWA6Si-1bKhUZ8Iexpd3GrPO9CPY_NAzFu0shk8w%3D%3D');
      const response = await axios.get('http://localhost:5000/gethistory');
      let filteredData = response.data;

      if (searchTerm) {
        filteredData = filteredData.filter(item =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.AzureCaseNumber.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || 
          item.Ticketname.toLowerCase().includes(searchTerm.toLocaleLowerCase())
        );
      }

      if (startDate && endDate) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item['Created-date']);
          return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        });
      }
      pageCount = Math.ceil(filteredData.length / itemsPerPage);
      setData(filteredData);
      setCurrentPage(prevPage => Math.min(prevPage, Math.floor(filteredData.length / itemsPerPage)));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = data.slice(offset, offset + itemsPerPage);
  var pageCount = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="history-container">
      <h1>Ticket Archive Github Actions Test</h1>
      <div>
        <ui5-input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.target.value)}
          onChange={(e) => setSearchTerm(e.target.value)}
        />{' '}
        <DatePicker
          type="date"
          value={startDate}
          onInput={(e) => setStartDate(e.target.value)}
          onChange={(e) => setStartDate(e.target.value)}
          primaryCalendarType="Gregorian"
        />{' '}
        <DatePicker
          type="date"
          value={endDate}
          onInput={(e) => setEndDate(e.target.value)}
          onChange={(e) => setEndDate(e.target.value)}
          primaryCalendarType="Gregorian"
        />
      </div>
      <br></br>
      {loading ? (<Loadingcomponent />) : (
        <div style={styles.table}>
          <Table
            columns={
              <>
                <TableColumn>
                  <Label>Title</Label>
                </TableColumn>
                <TableColumn>
                  <Label>Azure Case Number</Label>
                </TableColumn>
                <TableColumn>
                  <Label>Ticket Name</Label>
                </TableColumn>
                <TableColumn>
                  <Label>Severity</Label>
                </TableColumn>
                <TableColumn>
                  <Label>Created Date</Label>
                </TableColumn>
                <TableColumn>
                  <Label>Status</Label>
                </TableColumn>
              </>
            }
          >
            {currentPageData?.map((row) => (
              <TableRow key={row.AzureCaseNumber}>
                <TableCell>
                  <Label>{row.title}</Label>
                </TableCell>
                <TableCell>
                  <Label>{row.AzureCaseNumber}</Label>
                </TableCell>
                <TableCell>
                  <Label>{row.Ticketname}</Label>
                </TableCell>
                <TableCell>
                  <Label>
                    {row.Severity}
                  </Label>
                </TableCell>
                <TableCell>
                  <Label>{new Date(row['Created-date']).toLocaleString()}</Label>
                </TableCell>
                <TableCell>
                  <Label>{row.Status}</Label>
                </TableCell>
              </TableRow>
              
            ))}
          </Table>
        </div>)
      }
      <ReactPaginate
        previousLabel={'previous'}
        nextLabel={'next'}
        breakLabel={'...'}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
    </div>
  );
  /*return (
    <Table
  columns={<><TableColumn style={{width: '12rem'}}><Label>Product</Label></TableColumn><TableColumn minWidth={800} popinText="Supplier"><Label>Supplier</Label></TableColumn><TableColumn demandPopin minWidth={600} popinText="Dimensions"><Label>Dimensions</Label></TableColumn><TableColumn demandPopin minWidth={600} popinText="Weight"><Label>Weight</Label></TableColumn><TableColumn><Label>Price</Label></TableColumn></>}
  onLoadMore={function _a(){}}
  onPopinChange={function _a(){}}
  onRowClick={function _a(){}}
  onSelectionChange={function _a(){}}
>
  <TableRow>
    <TableCell>
      <Label>
        Notebook Basic
      </Label>
    </TableCell>
    <TableCell>
      <Label>
        Very Best Screens
      </Label>
    </TableCell>
    <TableCell>
      <Label>
        30 x 18 x 3cm
      </Label>
    </TableCell>
    <TableCell>
      <Label>
        4.2KG
      </Label>
    </TableCell>
    <TableCell>
      <Label>
        956EUR
      </Label>
    </TableCell>
  </TableRow>
  <TableRow>
    <TableCell>
      <Label>
        Notebook Basic 17HT-1001
      </Label>
    </TableCell>
    <TableCell>
      <Label>
        Very Best Screens
      </Label>
    </TableCell>
    <TableCell>
      <Label>
        29 x 17 x 3.1cm
      </Label>
    </TableCell>
    <TableCell>
      <Label>
        4.5KG
      </Label>
    </TableCell>
    <TableCell>
      <Label>
        1249EUR
      </Label>
    </TableCell>
  </TableRow>
</Table>
  );*/
};


export default ViewHistory;
