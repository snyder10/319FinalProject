import React, { useState, useEffect, useMemo, act } from "react";
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => {

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState("Home");
  const [categories, setCategories] = useState([])
  const [loadPage, setLoadPage] = useState(true);
  const [activeButtons, setActiveButtons] = useState({})

  const fetchProducts = async (extension) => {
    const response = await fetch(`http://localhost:8081/products${extension}?sub=${JSON.stringify(categories)}`);
    const data = await response.json();
    return data;
  }

  const addCategory = (event) => {
    event.preventDefault();
    let category = event.target.textContent;
    if (categories.includes(category)){
      console.log("Removing " + category);
      console.log(categories);
      setCategories(oldArray => {
        return oldArray.filter(oldCategory => oldCategory !== category);
      });
      setActiveButtons(prevState => ({...prevState, [category]: false}))
      setLoadPage(true);
    } else {
      console.log("Adding " + category);
      console.log(categories);
      setCategories(oldArray => [...oldArray, category]);
      event.target.className = "";
      setActiveButtons(prevState => ({...prevState, [category]: true}))
      setLoadPage(true);
    }
  }

  function changePage(page) {
    setPage(page);
    setProducts([]);
    setCategories([]);
    setActiveButtons({});
  }

  const RenderProducts = () => {
    console.log(products)
    return (
        <section id="Projects" className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5">
          {products.map((product, index) => (
            <div key={index} className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
              <a href="#">
                <img src={`http://localhost:8081/images/${product.name}.jpg`}
                  alt="Product" className="h-72 w-72 object-cover rounded-t-xl" />
                <div className="px-4 py-3 w-72">
                  <p className="text-lg font-bold text-black truncate block capitalize">{product.name}</p>
                  <div className="flex items-center">
                    <p className="text-lg font-semibold text-black cursor-auto my-3">${product.price}</p>
                    <del>
                      <p className="text-sm text-gray-600 cursor-auto ml-2">${product["original price"]}</p>
                    </del>
                    <div className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                      fill="currentColor" className="bi bi-bag-plus" viewBox="0 0 16 16">
                      <path fillRule="evenodd"
                        d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" />
                      <path
                        d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                    </svg></div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </section>);
  }

  const GroceryPage = () => {
    useEffect(() => {
      const getProducts = async () => {
        const products = await fetchProducts("/Grocery");
        setProducts(products);
      };
      if (loadPage){
        getProducts();
        setLoadPage(false)
      }
    }, []);
    return (<div>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <p className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Supershop</span>
          </p>
          <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <button onClick={() => changePage("Home")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Home</button>
              </li>
              <li>
                <button onClick={() => changePage("Grocery")} className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Grocery</button>
              </li>
              <li>
                <button onClick={() => changePage("Sporting Goods")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Sporting Goods</button>
              </li>
              <li>
                <button onClick={() => changePage("Apparel")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Apparel</button>
              </li>
              <li>
                <button onClick={() => changePage("About")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">About</button>
              </li>
              <li>
                <button onClick={() => changePage("Cart")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Cart</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="w-64 h-full bg-gray-800 text-white hidden md:block float-left text-left">
        <div className="p-5 float w-full">Categories</div>
        <ul className="space-y-2 w-full">
          <li><button onClick={addCategory} className={activeButtons["Fruit"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950": "text-left block p-10 hover:bg-gray-700 w-full"}>Fruit</button></li>
          <li><button onClick={addCategory} className={activeButtons["Meat"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950": "text-left block p-10 hover:bg-gray-700 w-full"}>Meat</button></li>
          <li><button onClick={addCategory} className={activeButtons["Bread"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950": "text-left block p-10 hover:bg-gray-700 w-full"}>Bread</button></li>
          <li><button onClick={addCategory} className={activeButtons["Sales"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950": "text-left block p-10 hover:bg-gray-700 w-full"}>Sales</button></li>
        </ul>
      </div>
      <RenderProducts />
    </div>
    );
  }

  const HomePage = () => {
    useEffect(() => {
      const getProducts = async () => {
        const products = await fetchProducts("");
        setProducts(products);
      };

      if (products.length === 0) {
        getProducts();
      }
    }, []);
    return (<div>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <p className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Supershop</span>
          </p>
          <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <button onClick={() => changePage("Home")} className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Home</button>
              </li>
              <li>
                <button onClick={() => changePage("Grocery")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Grocery</button>
              </li>
              <li>
                <button onClick={() => changePage("Sporting Goods")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Sporting Goods</button>
              </li>
              <li>
                <button onClick={() => changePage("Apparel")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Apparel</button>
              </li>
              <li>
                <button onClick={() => changePage("About")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">About</button>
              </li>
              <li>
                <button onClick={() => changePage("Cart")} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Cart</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <RenderProducts />
    </div>);
  }

  if (page === "Home") {
    return <HomePage />
  } else if (page === "Grocery") {
    return <GroceryPage />
  } else {
    return <HomePage />
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
