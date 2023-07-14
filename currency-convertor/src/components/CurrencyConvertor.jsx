import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './style.css';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [currencyList, setCurrencyList] = useState([]);

  useEffect(() => {
    fetchCurrencyList();
  }, []);

  const fetchCurrencyList = async () => {
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      const data = response.data;
      const currencies = Object.keys(data.rates);
      const currencyData = currencies.map((currency) => ({
        currency,
        rate: data.rates[currency],
      }));
      setCurrencyList(currencyData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleConvert = async () => {
    if (amount && fromCurrency && toCurrency) {
      try {
        const response = await axios.post('/api/v1/currency_converter/convert', {
          amount,
          from: fromCurrency,
          to: toCurrency,
        });
        const data = response.data;
        setConvertedAmount(data.converted_amount);
        console.log('API Call successful');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleSaveData = async () => {
    try {
      await axios.post('/api/v1/currency_converter/save_data');
      console.log('Data saved successfully');

      // Fetch the data from the database after saving
      const response = await fetch('/api/v1/currency_converter/fetch_data');
      const data = await response.json();
      // setFetchedData(data);
      console.log('Fetched data:', data);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  const handleDownload = () => {
    if (currencyList.length === 0) {
      console.error('Currency list not available');
      return;
    }

    const sheetData = currencyList.map((currency) => ({
      Currency: currency.currency,
      Rate: currency.rate,
    }));

    const sheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Currency List');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAsExcelFile(excelBuffer, 'currency_list.xlsx');
  };

  const saveAsExcelFile = (buffer, fileName) => {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  const swapFields = () => {

    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className='currencypage'>

      <div className="card" id='Card'>
        <div className='d-flex justify-content-around'>
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="100" fill="currentColor" class="bi bi-currency-exchange" viewBox="0 0 16 16">
          <path d="M0 5a5.002 5.002 0 0 0 4.027 4.905 6.46 6.46 0 0 1 .544-2.073C3.695 7.536 3.132 6.864 3 5.91h-.5v-.426h.466V5.05c0-.046 0-.093.004-.135H2.5v-.427h.511C3.236 3.24 4.213 2.5 5.681 2.5c.316 0 .59.031.819.085v.733a3.46 3.46 0 0 0-.815-.082c-.919 0-1.538.466-1.734 1.252h1.917v.427h-1.98c-.003.046-.003.097-.003.147v.422h1.983v.427H3.93c.118.602.468 1.03 1.005 1.229a6.5 6.5 0 0 1 4.97-3.113A5.002 5.002 0 0 0 0 5zm16 5.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zm-7.75 1.322c.069.835.746 1.485 1.964 1.562V14h.54v-.62c1.259-.086 1.996-.74 1.996-1.69 0-.865-.563-1.31-1.57-1.54l-.426-.1V8.374c.54.06.884.347.966.745h.948c-.07-.804-.779-1.433-1.914-1.502V7h-.54v.629c-1.076.103-1.808.732-1.808 1.622 0 .787.544 1.288 1.45 1.493l.358.085v1.78c-.554-.08-.92-.376-1.003-.787H8.25zm1.96-1.895c-.532-.12-.82-.364-.82-.732 0-.41.311-.719.824-.809v1.54h-.005zm.622 1.044c.645.145.943.38.943.796 0 .474-.37.8-1.02.86v-1.674l.077.018z" />
        </svg>
        <h2 className=' mt-5 mb-5'>Currency Convertor</h2>
        </div>

        <OverlayTrigger placement="top" overlay={<Tooltip>insert Amount</Tooltip>}>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className='form-control mt-4 mb-4' />
        </OverlayTrigger>

        <OverlayTrigger placement="left" overlay={<Tooltip>Select Country</Tooltip>}>
          <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className='form-control mt-4 mb-4'>
            <option value=""></option>
            {currencyList.map((currency) => (
              <option value={currency.currency} key={currency.currency}>
                {currency.currency}
              </option>
            ))}
          </select>
        </OverlayTrigger>
        <div className='text-center '>

          <OverlayTrigger placement="right" overlay={<Tooltip>Swap </Tooltip>}>
            <button onClick={swapFields} className='border-0'>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-up" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z" />
              </svg>
            </button>
          </OverlayTrigger>
        </div>


        <OverlayTrigger placement="right" overlay={<Tooltip>Select Country</Tooltip>}>
          <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className='form-control mt-3 mb-4'>
            <option value=""></option>
            {currencyList.map((currency) => (
              <option value={currency.currency} key={currency.currency}>
                {currency.currency}
              </option>
            ))}
          </select>
        </OverlayTrigger>

        <div className='text-center mt-3'>
          <OverlayTrigger placement="top" overlay={<Tooltip>Convert</Tooltip>}>
            <button onClick={handleConvert} className='btn btn-info rounded-pill mb-4'>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z" />
              </svg>
            </button>
          </OverlayTrigger>
        </div>

        <div className='text-center mb-4 '>
          <h3> Converted Amount: </h3>
          <p className='convertedAmount'>{convertedAmount}</p>
        </div>
        <div className='text-center'>
          <h3>click here to download document</h3>
        </div>
        <div className='d-flex justify-content-center mt-4'>
          <OverlayTrigger placement="top" overlay={<Tooltip>Download</Tooltip>}>
            <button onClick={handleDownload} className='btn btn-outline-dark rounded-pill' >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cloud-download" viewBox="0 0 16 16">
                <path d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
                <path d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z" />
              </svg>
            </button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip>Save</Tooltip>}>
            <button className="btn btn-outline-info rounded-pill mx-3" onClick={handleSaveData} >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-save" viewBox="0 0 16 16">
                <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z" />
              </svg>
            </button>
          </OverlayTrigger>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
