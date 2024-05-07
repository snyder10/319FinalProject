import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => {

  const sortingOptions = {
    "Price: Low to High": [
      { "priority": "price", "direction": "ascending" },
      { "priority": "inventory", "direction": "descending" },
      { "priority": "name", "direction": "ascending" }
    ],
    "Price: High to Low": [
      { "priority": "price", "direction": "descending" },
      { "priority": "inventory", "direction": "descending" },
      { "priority": "name", "direction": "ascending" }
    ],
    "Inventory: Low to High": [
      { "priority": "inventory", "direction": "ascending" },
      { "priority": "price", "direction": "ascending" },
      { "priority": "name", "direction": "ascending" }
    ],
    "Inventory: High to Low": [
      { "priority": "inventory", "direction": "descending" },
      { "priority": "price", "direction": "ascending" },
      { "priority": "name", "direction": "ascending" }
    ]
  }

  const [products, setProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [page, setPage] = useState("Home");
  const [categories, setCategories] = useState([])
  const [sort, setSort] = useState("Price: Low to High")
  const [loadPage, setLoadPage] = useState(true);
  const [activeButtons, setActiveButtons] = useState({})
  const [user, setUser] = useState({})
  const [cart, setCart] = useState({});
  const [currentProduct, setCurrentProduct] = useState({});

  const fetchProducts = async (extension) => {
    const response = await fetch(`http://localhost:8081/products${extension}`);
    const data = await response.json();
    return data;
  }

  function displayProductPage(product) {
    setCurrentProduct(product);
    changePage("Product")
  }

  const addCategory = (event) => {
    event.preventDefault();
    let category = event.target.textContent;
    if (categories.includes(category)) {
      setCategories(oldArray => {
        return oldArray.filter(oldCategory => oldCategory !== category);
      });
      setActiveButtons(prevState => ({ ...prevState, [category]: false }))
      setLoadPage(true);
    } else {
      setCategories(oldArray => [...oldArray, category]);
      event.target.className = "";
      setActiveButtons(prevState => ({ ...prevState, [category]: true }))
      setLoadPage(true);
    }
  }

  function changePage(page) {
    setPage(page);
    setProducts([]);
    setCategories([]);
    setActiveButtons({});
    setSort("Price: Low to High")
    setLoadPage(true);
  }

  function RenderProducts({ productArray }) {
    function submitUpdate(event) {
      event.preventDefault();
      const formData = new FormData(event.target);
      let data = {
        "email": user.email,
        "password": user.password,
        "inventory": formData.get("inventory"),
        "product": event.target.id
      }
      fetch(`http://localhost:8081/inventory`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        if (response.status !== 200) {
          return;
        }
        return response;
      })
        .then(response => {
          if (response) {
            alert("Inventory successfully updated.")
            setLoadPage("True");
          } else {
            alert("Failure updating inventory")
          }
        })
    }

    function removeFromCart(item) {
      if (user.username && user.password) {
        let data = {
          "username": user.username,
          "password": user.password,
          "product": item,
          "add": false
        }
        fetch(`http://localhost:8081/cart`, {
          method: "PUT",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json"
          }
        }).then(response => {
          if (response.status !== 200) {
            return;
          }
          return response.json();
        })
          .then(response => {
            if (response) {
              setCart(response)
            } else {
              alert("Failure updating cart")
            }
          })
      } else {
        setCart(prevCart => {
          const newCart = { ...prevCart };
          if (newCart[item] > 1) {
            newCart[item] -= 1;
          } else {
            delete newCart[item];
          }
          return newCart;
        });
      }
    }

    function addToCart(item) {
      if (user.username && user.password) {
        let data = {
          "username": user.username,
          "password": user.password,
          "product": item,
          "add": true
        }
        fetch(`http://localhost:8081/cart`, {
          method: "PUT",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json"
          }
        }).then(response => {
          if (response.status !== 200) {
            return;
          }
          return response.json();
        })
          .then(response => {
            if (response) {
              setCart(response)
            } else {
              alert("Failure updating cart")
            }
          })
      } else {
        setCart(prevCart => ({ ...prevCart, [item]: (prevCart[item] || 0) + 1 }));
      }
    }

    return (
      <section id="Projects" className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5">
        {productArray.map((product, index) => (
          <div key={index} className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
            <img onClick={() => displayProductPage(product)} src={product.image}
              alt="Product" className="h-72 w-72 object-cover rounded-t-xl" />
            <div className="px-4 py-3 w-72">
              <p className="text-lg font-bold text-black truncate block capitalize">{product.name}</p>
              <div className="flex items-center">
                <p className="text-lg font-semibold text-black cursor-auto my-3">${product.price}</p>
                <del>
                  <p className={product.price !== product["original price"] ? "text-sm text-gray-600 cursor-auto ml-2" : "hidden"}>${product["original price"]}</p>
                </del>
              </div>
              <p className="text-lg font-semibold text-black cursor-auto my-3">Inventory: {product.inventory}</p>
              <div className="flex justify-between items-center w-full">
                <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={() => removeFromCart(product.name)}>-</button>
                <span className="border-solid select-none text-lg font-bold text-black">{cart[product.name] ? cart[product.name] : 0}</span>
                <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={() => addToCart(product.name)} >+</button>
              </div>
              {user.employee &&
                <form className="max-w-sm mx-auto" id={product._id} onSubmit={submitUpdate}>
                  <label htmlFor={`number-input-${product._id}`} className="block mb-2 text-sm font-medium text-gray-900">Update Inventory:</label>
                  <input type="number" id={`number-input-${product._id}`} name="inventory" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={product.inventory} />
                </form>
              }
            </div>
          </div>
        ))}
      </section>);
  }

  const Navbar = () => {
    return (
      <nav className="sticky top-0 bg-white border-gray-200 dark:bg-gray-900 z-50">
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
                <button onClick={() => changePage("Home")} className={page === "Home" ? "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"}>Home</button>
              </li>
              <li>
                <button onClick={() => changePage("Grocery")} className={page === "Grocery" ? "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"}>Grocery</button>
              </li>
              <li>
                <button onClick={() => changePage("Sporting Goods")} className={page === "Sporting Goods" ? "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"}>Sporting Goods</button>
              </li>
              <li>
                <button onClick={() => changePage("Apparel")} className={page === "Apparel" ? "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"}>Apparel</button>
              </li>
              <li>
                <button onClick={() => changePage("About")} className={page === "About" ? "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"}>About</button>
              </li>
              {
                user.username ?
                  <li>
                    <button onClick={() => changePage("User")} className={page === "User" ? "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"}>{user.username}</button>
                  </li>
                  :
                  <li>
                    <button onClick={() => changePage("Login")} className={page === "Login" || page === "Create Account" ? "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"}>Login</button>
                  </li>
              }
              <li>
                <button onClick={() => changePage("Cart")} className={page === "Cart" ? "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"}>Cart</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>)
  };

  const FilterSelect = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
      <div className="relative float-right pr-48 pt-10">
        <button onClick={toggleDropdown} className="bg-blue-500 text-white px-4 py-2 rounded-md focus:outline-none">
          Change Sorting Standard
        </button>
        {isOpen && (
          <ul className="absolute bg-white shadow-lg rounded-md mt-2 py-1 w-48 border">
            {Object.keys(sortingOptions).map((key, index) => (
              <li onClick={() => switchSortingOption(key)} className={sort === key ? "px-4 py-2 hover:bg-gray-100 cursor-pointer font-bold" : "px-4 py-2 hover:bg-gray-100 cursor-pointer"} key={index}>{key}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  function switchSortingOption(option) {
    setSort(option);
    setLoadPage(true);
  }

  const GroceryPage = () => {
    useEffect(() => {
      const getProducts = async () => {
        const products = await fetchProducts(`/Grocery?sub=${JSON.stringify(categories)}&sort=${JSON.stringify(sortingOptions[sort])}`);
        setProducts(products);
      };
      if (loadPage) {
        getProducts();
        setLoadPage(false)
      }
    }, []);
    return (<div>
      <Navbar />
      <div className="w-64 h-full bg-gray-800 text-white hidden md:block float-left text-left">
        <div className="p-5 float w-full">Categories</div>
        <ul className="space-y-2 w-full">
          <li><button onClick={addCategory} className={activeButtons["Fruit"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Fruit</button></li>
          <li><button onClick={addCategory} className={activeButtons["Meat"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Meat</button></li>
          <li><button onClick={addCategory} className={activeButtons["Bread"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Bread</button></li>
          <li><button onClick={addCategory} className={activeButtons["Sales"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Sales</button></li>
        </ul>
      </div>
      <FilterSelect />
      <RenderProducts productArray={products} />
    </div>
    );
  }

  const ApparelPage = () => {
    useEffect(() => {
      const getProducts = async () => {
        const products = await fetchProducts(`/Apparel?sub=${JSON.stringify(categories)}&sort=${JSON.stringify(sortingOptions[sort])}`);
        setProducts(products);
      };
      if (loadPage) {
        getProducts();
        setLoadPage(false)
      }
    }, []);
    return (<div>
      <Navbar />
      <div className="w-64 h-full bg-gray-800 text-white hidden md:block float-left text-left">
        <div className="p-5 float w-full">Categories</div>
        <ul className="space-y-2 w-full">
          <li><button onClick={addCategory} className={activeButtons["Shoes"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Shoes</button></li>
          <li><button onClick={addCategory} className={activeButtons["Clothing"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Clothing</button></li>
          <li><button onClick={addCategory} className={activeButtons["Accessories"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Accessories</button></li>
          <li><button onClick={addCategory} className={activeButtons["Sales"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Sales</button></li>
        </ul>
      </div>
      <FilterSelect />
      <RenderProducts productArray={products} />
    </div>
    );
  }

  const SportingGoodsPage = () => {
    useEffect(() => {
      const getProducts = async () => {
        const products = await fetchProducts(`/Sporting Goods?sub=${JSON.stringify(categories)}&sort=${JSON.stringify(sortingOptions[sort])}`);
        setProducts(products);
      };
      if (loadPage) {
        getProducts();
        setLoadPage(false)
      }
    }, []);
    return (<div>
      <Navbar />
      <div className="w-64 h-full bg-gray-800 text-white hidden md:block float-left text-left">
        <div className="p-5 float w-full">Categories</div>
        <ul className="space-y-2 w-full">
          <li><button onClick={addCategory} className={activeButtons["Bikes"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Bikes</button></li>
          <li><button onClick={addCategory} className={activeButtons["Sports"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Sports</button></li>
          <li><button onClick={addCategory} className={activeButtons["Sales"] ? "text-left block p-10 hover:bg-gray-500 w-full bg-slate-950" : "text-left block p-10 hover:bg-gray-700 w-full"}>Sales</button></li>
        </ul>
      </div>
      <FilterSelect />
      <RenderProducts productArray={products} />
    </div>
    );
  }

  const HomePage = () => {
    useEffect(() => {
      const getProducts = async () => {
        const products = await fetchProducts(`?sub=${JSON.stringify(["Sales"])}&sort=${JSON.stringify(sortingOptions[sort])}`);
        setProducts(products);
        const trendingProducts = await fetchProducts(`/trending?sort=${JSON.stringify(sortingOptions[sort])}`);
        setTrending(trendingProducts);
      };

      if (loadPage) {
        getProducts();
        setLoadPage(false)
      }
    }, []);
    return (<div>
      <Navbar />
      <FilterSelect />
      <div className="flex grid grid-cols-1 items-center text-center">
        <p className="justify-items-center justify-center content-center text-center text-3xl font-bold text-black capitalize mt-20">On Sale</p>
        <RenderProducts productArray={products} />
        <p className="justify-items-center justify-center content-center text-center text-3xl font-bold text-black capitalize mt-20">Trending</p>
        <RenderProducts productArray={trending} />
      </div>
      {console.log(trending)};
    </div>);
  }


  const LoginPage = () => {

    const [invalidLogin, setInvalidLogin] = useState(false);

    function submitLogin(event) {
      event.preventDefault();
      const formData = new FormData(event.target);
      let data = {
        "email": formData.get("email"),
        "password": formData.get("password")
      }
      fetch(`http://localhost:8081/user/login`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        if (response.status !== 200) {
          return;
        }
        return response.json();
      })
        .then(user => {
          if (user) {
            user.password = formData.get("password");
            setUser(user);
            setPage("User");
            setCart(user["cart"])
          } else {
            setInvalidLogin(true);
          }
        })
    }

    return (
      <div>
        <Navbar />
        <section>
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Login
                </h1>
                <form className="space-y-4 md:space-y-6" onSubmit={submitLogin}>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                    <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input type="password" name="password" id="password" placeholder="********" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required pattern="^.{8,64}$" />
                  </div>
                  {
                    invalidLogin &&
                    <p className="text-sm font-light text-red-500">
                      Invalid username or password. Please try again
                    </p>
                  }
                  <button type="submit" className="w-full text-black dark:text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Login</button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Don’t have an account yet? <button onClick={() => changePage("Create Account")} className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign Up</button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  function deleteAccount() {
    let data = {
      "username": user.username,
      "password": user.password
    }
    fetch(`http://localhost:8081/user`, {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(response => {
      if (response.status !== 200) {
        return;
      }
      return response.json();
    })
      .then(response => {
        if (response) {
          setUser({});
          alert("Account successfully deleted.")
          setPage("Home");
        } else {
          alert("Failure deleting account")
        }
      })
  }

  const UserPage = () => {
    const [showModal, setShowModal] = useState(false);
    return (
      <div className="w-full">
        <Navbar />
        {user.username && (
          <div className="flex flex-col justify-center items-center">
            <div className="ml-5 p-10 xl:basis-4/5 flex flex-col justify-center items-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-600 category-title">User Information</h2>
              <h3 className="text-lg text-gray-700"><b>Username:</b> {user.username}</h3>
              <h3 className="text-lg text-gray-700"><b>Phone:</b> {user.phone}</h3>
              <h3 className="text-lg text-gray-700"><b>Email:</b> {user.email}</h3>
              <h3 className="text-lg text-gray-700"><b>Address:</b> {user.address}, {user.city}, {user.state}, {user.zip}</h3>
            </div>
            <button type="button" id="deleteButton" onClick={() => { setUser({}); changePage("Home") }} className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900">
              Logout
            </button>
            <button type="button" id="deleteButton" onClick={() => setShowModal(true)} className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
              Delete Account
            </button>
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden">
                <div className="relative p-4 w-full max-w-md h-auto">
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 p-6 text-center">
                    <button type="button" className="absolute top-2.5 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setShowModal(false)}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                    <svg className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    <p className="mb-4 text-gray-500 dark:text-gray-300">Are you sure you want to delete your account? You cannot undo this decision.</p>
                    <div className="flex justify-center items-center space-x-4">
                      <button onClick={() => setShowModal(false)} className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-500 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600">
                        No, cancel
                      </button>
                      <button onClick={deleteAccount} className="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                        Yes, I'm sure
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>);
  }

  const AccountCreationPage = () => {

    const [invalidUsername, setInvalidUsername] = useState(false);

    function submitLogin(event) {
      event.preventDefault();
      const formData = new FormData(event.target);
      let data = {
        "username": formData.get("username"),
        "password": formData.get("password"),
        "address": formData.get("address"),
        "zip": formData.get("zip"),
        "card": formData.get("credit card number"),
        "email": formData.get("email"),
        "phone": formData.get("phone"),
        "city": formData.get("city"),
        "state": formData.get("state"),
        "cart": cart
      }
      fetch(`http://localhost:8081/user`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        if (response.status !== 200) {
          return;
        }
        return response.json();
      })
        .then(user => {
          if (user) {
            user.password = formData.get("password");
            setUser(user);
            setPage("User");
          } else {
            setInvalidUsername(true);
          }
        })
    }

    return (
      <div>
        <Navbar />
        <section>
          <div className="flex flex-col items-center justify-center px-6 py-8 my-20 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Create Account
                </h1>
                <form className="space-y-4 md:space-y-6" onSubmit={submitLogin}>
                  <div>
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                    <input type="username" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="username" required pattern="^.{8,64}$" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                    <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input type="password" name="password" id="password" placeholder="xxxxxxxx" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required pattern="^.{8,64}$" />
                  </div>
                  <div>
                    <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
                    <input type="address" name="address" id="address" placeholder="123 E Home St" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required pattern="^.{8,64}$" />
                  </div>
                  <div>
                    <label htmlFor="zip" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ZIP Code</label>
                    <input type="zip" name="zip" id="zip" placeholder="12345" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required pattern="^[0-9]{5}$" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City</label>
                    <input type="city" name="city" id="city" placeholder="Ames" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                  </div>
                  <div>
                    <label htmlFor="state" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">State</label>
                    <input type="state" name="state" id="state" placeholder="IA" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required pattern="^[A-Z]{2}$" />
                  </div>
                  <div>
                    <label htmlFor="card-number-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Credit Card Number</label>
                    <input type="text" name="card-number-input" id="card-number-input" placeholder="xxxx-xxxx-xxxx-xxxx" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required pattern="^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
                    <input type="phone" name="phone" id="phone" placeholder="xxx-xxx-xxxx" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required pattern="^[0-9]{3}-[0-9]{3}-[0-9]{4}$" />
                  </div>
                  {
                    invalidUsername &&
                    <p className="text-sm font-light text-red-500">
                      This username is already taken. Please try again.
                    </p>
                  }
                  <button type="submit" className="w-full text-black dark:text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Create Account</button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Already have an account? <button onClick={() => changePage("Login")} className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign In</button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const CartPage = () => {
    useEffect(() => {
      const getProducts = async () => {
        const names = Object.keys(cart)
        const products = await fetchProducts(`?sort=${JSON.stringify(sortingOptions[sort])}&names=${JSON.stringify(names)}`);
        setProducts(products);
      };

      if (loadPage) {
        getProducts();
        setLoadPage(false)
      }
    }, []);

    const RenderCart = () => {
      function removeFromCart(item) {
        if (user.username && user.password) {
          let data = {
            "username": user.username,
            "password": user.password,
            "product": item,
            "add": false
          }
          fetch(`http://localhost:8081/cart`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json"
            }
          }).then(response => {
            if (response.status !== 200) {
              return;
            }
            return response.json();
          })
            .then(response => {
              if (response) {
                setCart(response)
              } else {
                alert("Failure updating cart")
              }
            })
        } else {
          setCart(prevCart => {
            const newCart = { ...prevCart };
            if (newCart[item] > 1) {
              newCart[item] -= 1;
            } else {
              delete newCart[item];
            }
            return newCart;
          });
        }
      }

      function addToCart(item) {
        if (user.username && user.password) {
          let data = {
            "username": user.username,
            "password": user.password,
            "product": item,
            "add": true
          }
          fetch(`http://localhost:8081/cart`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json"
            }
          }).then(response => {
            if (response.status !== 200) {
              return;
            }
            return response.json();
          })
            .then(response => {
              if (response) {
                setCart(response)
              } else {
                alert("Failure updating cart")
              }
            })
        } else {
          setCart(prevCart => ({ ...prevCart, [item]: (prevCart[item] || 0) + 1 }));
        }
      }

      return (
        <div className="w-3/6 grid grid-cols-1 divide-y justify-items-center justify-center flex-1">
          <section id="Projects" className="w-4/6 grid grid-cols-1 xl:grid-cols-2 justify-items-center justify-center content-center gap-y-5 mt-10 mb-5">
            {products.map((product, index) => (
              <div key={index} className="w-fit bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl text-center content-center justify-items-center justify-center">
                <div className="px-4 py-3 w-56 text-center content-center justify-items-center justify-center">
                  <p className="text-lg font-bold text-black truncate capitalize">{product.name}</p>
                  <img src={product.image} alt="Product" className="h-16 w-16 object-cover rounded-t-xl" />
                  <div className="flex w-full items-center float-right">
                    <p className="text-lg font-semibold text-black cursor-auto my-3">${product.price}</p>
                    <del>
                      <p className={product.price !== product["original price"] ? "text-sm text-gray-600 cursor-auto ml-2" : "hidden"}>${product["original price"]}</p>
                    </del>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={() => removeFromCart(product.name)}>-</button>
                    <span className="border-solid select-none text-lg font-bold text-black">{cart[product.name] ? cart[product.name] : 0}</span>
                    <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={() => addToCart(product.name)} >+</button>
                  </div>
                </div>
              </div>
            ))}
          </section>
          <div className="justify-items-center justify-center w-4/6 flex content-center text-center text-lg font-bold text-black capitalize">
            Total: ${parseFloat(Object.values(products).reduce((acc, product) => acc + product.price * cart[product.name], 0)).toFixed(2)}
          </div>
        </div>);
    }

    function submitCartWithAccount() {
      let data = {
        "email": user.email,
        "password": user.password
      }
      fetch(`http://localhost:8081/purchase`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        if (response.status !== 200) {
          return;
        }
        return response;
      })
        .then(response => {
          if (response) {
            alert("Purchase successfully completed.")
            setCart({});
            changePage("Home")
          } else {
            alert("Failure completing purchase.")
          }
        })
    }

    function submitCartWithCard(event) {
      event.preventDefault();
      let formData = new FormData(event.target)
      let data = {
        "products": cart,
        "card": formData.get("card-number-input")
      }
      fetch(`http://localhost:8081/purchase`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        if (response.status !== 200) {
          return;
        }
        return response;
      })
        .then(response => {
          if (response) {
            alert("Purchase successfully completed.")
            setCart({});
            changePage("Home")
          } else {
            alert("Failure completing purchase.")
          }
        })
    }

    const RenderPayment = () => {
      return (
        <div className="flex-1 w-3/6 justify-items-center justify-center float-right mt-10 mb-5">
          {
            user.credit_card_num ?
              <div className="text-center justify-items-center justify-center">
                <div className="text-lg font-bold text-black capitalize">You are currently signed in and have your payment information stored. No further information is needed.</div>
                <button type="button" onClick={() => submitCartWithAccount()} className="mt-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Confirm Purchase</button>
              </div>
              :
              <div className="text-center justify-items-center justify-center">

                <form onSubmit={submitCartWithCard} className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 lg:max-w-xl lg:p-8">
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Name </label>
                      <input type="text" id="name" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Your Name Here" required />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="card-number-input" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Card Number </label>
                      <input type="text" id="card-number-input" name="card-number-input" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="xxxx-xxxx-xxxx-xxxx" pattern="^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$" required />
                    </div>
                  </div>

                  <button type="submit" className="flex w-full text-black dark:text-white items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium hover:bg-primary-800 focus:outline-none focus:ring-4  focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Pay Now</button>
                </form>
              </div>
          }
        </div>
      );
    }

    return (
      <div>
        <Navbar />
        <div className="flex">
          <RenderCart />
          <RenderPayment />
        </div>
      </div>
    );
  }

  const AboutPage = () => {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col justify-center items-center">
          <div className="ml-5 p-10 xl:basis-4/5 flex flex-col justify-center items-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-600 category-title">Course Information</h2>
            <h3 className="text-lg text-gray-700"><b>Course:</b> SE/ComS319 Construction of User Interfaces, Spring 2024</h3>
            <h3 className="text-lg text-gray-700"><b>Date:</b> May 6, 2024</h3>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-600 category-title mt-10">Students</h2>
            <h3 className="text-lg text-gray-700"><b>Andrew Snyder:</b> snyder10@iastate.edu</h3>
            <h3 className="text-lg text-gray-700"><b>Eli Ripperda:</b> ripperda@iastate.edu</h3>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-600 category-title mt-10">Professors</h2>
            <h3 className="text-lg text-gray-700"><b>Dr. Abraham N. Aldaco Gastelum:</b> aaldaco@iastate.edu</h3>
            <h3 className="text-lg text-gray-700"><b>Dr. Ali Jannesari:</b> jannesar@iastate.edu</h3>
          </div>
        </div>
      </div>
    );
  }

  const ProductPage = () => {
    let rating = "";
    for (let i = 0; i < currentProduct.rating; i++) {
      rating += "★";
    }

    for (let i = 0; i < 5 - currentProduct.rating; i++) {
      rating += "☆";
    }
    return (
      <div className="w-full">
        <Navbar />
        <section id="Projects" className="flex w-fit h-full mx-auto grid grid-cols-2 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5">
            <img src={currentProduct.image}
              alt="Product" className="flex-1 h-96 w-96 object-cover float-left rounded-xl" />
          <div className="px-4 py-3 w-96 flex-1 justify-items-center justify-center text-center rounded-xl bg-white">
            <p className="text-5xl font-bold text-sky-800 block capitalize">{currentProduct.name}</p>
            <div className="flex items-center text-center justify-items-center justify-center">
              <p className="text-lg font-semibold text-black cursor-auto my-3">${currentProduct.price}</p>
              <p className={currentProduct.price !== currentProduct["original price"] ? "line-through text-sm text-gray-600 cursor-auto ml-2" : "hidden"}>${currentProduct["original price"]}</p>
            </div>
            <p className="text-lg font-semibold text-black cursor-auto my-3">Inventory: {currentProduct.inventory}</p>
            <p className="text-lg font-semibold text-black cursor-auto my-3"> {rating}</p>
          </div>
        </section>
      </div>
    );
  }

  if (page === "Login") {
    return <LoginPage />
  } else if (page === "Grocery") {
    return <GroceryPage />
  } else if (page === "Apparel") {
    return <ApparelPage />
  } else if (page === "Sporting Goods") {
    return <SportingGoodsPage />
  } else if (page === "User") {
    return <UserPage />
  } else if (page === "Create Account") {
    return <AccountCreationPage />
  } else if (page === "Cart") {
    return <CartPage />
  } else if (page === "About") {
    return <AboutPage />
  } else if (page === "Product") {
    return <ProductPage />
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
