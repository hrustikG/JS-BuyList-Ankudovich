let initialProducts = [
    { name: 'Помідори', quantity: 1, isBought: false },
    { name: 'Печиво', quantity: 1, isBought: false },
    { name: 'Сир', quantity: 1, isBought: false },
];

const productList = document.getElementsByClassName('selected-product-list')[0];
const purchaseInfo = document.getElementsByClassName('purchase-info')[0];
const input = document.querySelector('.add-panel__input');
const addProductButton = document.querySelector('.add-panel__button');

function init() {
    if (!localStorage.getItem('productList')) {
        setProductsToLocalStorage(initialProducts);
    }
    
    const initialProductList = productList.querySelectorAll('.selected-product')
    initialProductList.forEach(item => item.remove());

    const purchaseInfoProducts = purchaseInfo.querySelectorAll('.products-summary__product');
    purchaseInfoProducts.forEach(item => item.remove());

    const productsFromLocalStorage = getProductsFromLocalStorage();
    productsFromLocalStorage.forEach(item => addSelectedProductToHTML(item.name, item.quantity, item.isBought));

}

function getProductsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('productList'));
}

function setProductsToLocalStorage(updatedProductList){
    localStorage.setItem('productList', JSON.stringify(updatedProductList)); 
}

function getProductSummaryItemByName(productName) {
    const productSummaries  = purchaseInfo.querySelectorAll('.products-summary__product-name');
    for (const item of productSummaries) {
        if (item.textContent.trim() === productName) {
            return item.closest('.products-summary__product');
        }
    }
    return null;
}
    
function addProduct() {
    const enteredProductName = input.value.trim();
    
    if(enteredProductName ==='') {
        alert("Назва товару не може бути порожньою!");
        return;
    }

    if(existNameInProductList(enteredProductName)) {
        alert("Товар з такою назва вже існує!");
        return;
    }

    const productListFromLocalStorage = getProductsFromLocalStorage();
    const newProduct = {
        name: enteredProductName,
        quantity: 1,
        isBought: false,
    }

    productListFromLocalStorage.push(newProduct);
    setProductsToLocalStorage(productListFromLocalStorage); 


    addSelectedProductToHTML(enteredProductName, newProduct.quantity, newProduct.isBought);

    input.value = ''; 
    input.focus();

}

function addSelectedProductToHTML(enteredProductName, productQuantity, isBought){
    const lastProductInList = productList.querySelector('li:last-child');

    const selectedProductListHTML = 
    `<li class="selected-product-list__item selected-product">
        <p class="selected-product__name">${enteredProductName}</p>
        <div class="count-panel">
          <button class="count-panel__minus ${productQuantity === 1 ? 'count-panel__minus_one' : ''} count-panel__button" aria-label="Зменшити кількість" data-tooltip="Зменшити кількість"><i class="fa fa-minus" aria-hidden="true"></i></button>
          <span class="count-panel__count">${productQuantity}</span>
          <button class="count-panel__plus count-panel__button" aria-label="Збільшити кількість" data-tooltip="Збільшити кількість"><i class="fa fa-plus" aria-hidden="true"></i></button>
        </div>
        <div class="button_panel">
          <button class="button_panel__bought_button"  data-tooltip="Купити товар">Куплено</button>
          <button class="button_panel__canceled_button" aria-label="Видалити товар" data-tooltip="Видалити товар"><i class="fa fa-times" aria-hidden="true"></i></button>
        </div>
      </li>`;

    lastProductInList.insertAdjacentHTML('afterend', selectedProductListHTML);
    const createdProduct = productList.querySelector('li:last-child');
        
    let productSummaryItem = document.createElement('li');
    productSummaryItem.classList.add('products-summary__product');
    productSummaryItem.innerHTML = `
        <span class="products-summary__product-name ">${enteredProductName}</span>
        <span class="products-summary__product-quantity ">${productQuantity}</span>
       `;

    if(isBought) {
        const boughtButton = createdProduct.querySelector('.button_panel__bought_button');
        addUnboughtStyles(createdProduct, boughtButton, productSummaryItem);

    } else {
        const unboughtProductSummaryList = purchaseInfo.querySelector('.products-summary__name_top + .products-summary__list');
        unboughtProductSummaryList.append(productSummaryItem);
    }

    addEventListersToButtonsForCreatedProduct(createdProduct);
}

function addEventListersToButtonsForCreatedProduct(createdProduct) {
    createdProduct.querySelector('.count-panel__minus').addEventListener('click', decreaseQuantityOfCreatedProduct);
    createdProduct.querySelector('.count-panel__plus').addEventListener('click', increaseQuantityOfCreatedProduct);
    createdProduct.querySelector('.button_panel__canceled_button').addEventListener('click', removeProductFromList);
    createdProduct.querySelector('.button_panel__bought_button').addEventListener('click', toggleProductBought);
    createdProduct.querySelector('.selected-product__name').addEventListener('dblclick', handleProductNameEdtion);
}

function handleProductNameEdtion() {
    const selectedProduct = this.closest('.selected-product'); 
    const productNameContainer = selectedProduct.querySelector('.selected-product__name');
    const productName = productNameContainer.textContent;
    const productSummaryItem = getProductSummaryItemByName(productName);
    
    let products = getProductsFromLocalStorage();
    let productFromLocalStorage = products.find(
        product => product.name.toLocaleLowerCase() === productName.toLocaleLowerCase()
    );

    if(productFromLocalStorage.isBought)
        return;

    let editProductNameInput = document.createElement('input');
    editProductNameInput.classList.add('input_product');
    editProductNameInput.type = 'text';
    editProductNameInput.value = productName;

    productNameContainer.innerHTML = ''; 
    productNameContainer.appendChild(editProductNameInput);
    editProductNameInput.select();

    let isHandlingChange = false; 

    const handleNameChange = () => {
        if(isHandlingChange)
            return;
        isHandlingChange = true; 

        const editedProductName = editProductNameInput.value.trim();
        if(!editedProductName){
            productNameContainer.textContent = productFromLocalStorage.name;
            alert("Ім'я товару при зміні не може бути порожнім!");
            isHandlingChange = false; 
            return;
        }
         if(products.find(product => 
           product.name.toLocaleLowerCase() === editedProductName.toLocaleLowerCase() &&
           product.name.toLocaleLowerCase() !== productFromLocalStorage.name.toLocaleLowerCase()
        ))  {
            productNameContainer.textContent = productFromLocalStorage.name;
            alert("Ім'я товару при зміні має бути унікальним!");
            isHandlingChange = false;
            return;
        }

        productFromLocalStorage.name = editedProductName;
        productSummaryItem.querySelector('.products-summary__product-name').textContent = editedProductName;
        productNameContainer.textContent = editedProductName
        setProductsToLocalStorage(products);   

        isHandlingChange = false;
    };
    
    editProductNameInput.addEventListener('blur', handleNameChange);
    
    editProductNameInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            handleNameChange();
        }
    });
}


function removeProductFromList() {
    const removedProduct = this.closest('.selected-product');
    const productName = removedProduct.querySelector('.selected-product__name').textContent;
    removedProduct.remove();

    const productSummary = getProductSummaryItemByName(productName);
    productSummary.remove();

    let products = getProductsFromLocalStorage();
    products = products.filter(product => product.name.toLocaleLowerCase() !== productName.toLocaleLowerCase());

    setProductsToLocalStorage(products);
}

function toggleProductBought() {
    const selectedProduct = this.closest('.selected-product');
    const productName = selectedProduct.querySelector('.selected-product__name').textContent;
    const boughtButton = selectedProduct.querySelector('.button_panel__bought_button');
    const productSummaryItem = getProductSummaryItemByName(productName);


    let products = getProductsFromLocalStorage();
    let productFromLocalStorage = products.find(
        product => product.name.toLocaleLowerCase() === productName.toLocaleLowerCase()
    );

    if(productFromLocalStorage.isBought){
        productFromLocalStorage.isBought = false;

        boughtButton.textContent = 'Куплено';
        boughtButton.classList.remove('button_panel__bought_button_not');

        selectedProduct.querySelector('.selected-product__name').classList.remove('selected-product__name_bought');
        selectedProduct.querySelector('.count-panel__minus').classList.remove('count-panel__button_bought');
        selectedProduct.querySelector('.count-panel__plus').classList.remove('count-panel__button_bought');
        selectedProduct.querySelector('.button_panel__canceled_button').classList.remove('button_panel__canceled_button_bought');

        productSummaryItem.querySelector('.products-summary__product-name').classList.remove('products-summary__product-name_bought');
        productSummaryItem.querySelector('.products-summary__product-quantity').classList.remove('products-summary__product-quantity_bought');

        const boughtProductSummaryList = purchaseInfo.querySelector('.products-summary__name_top + .products-summary__list');
        boughtProductSummaryList.appendChild(productSummaryItem); 

    } else {
        productFromLocalStorage.isBought = true;
        addUnboughtStyles(selectedProduct,boughtButton, productSummaryItem );
    }

    setProductsToLocalStorage(products);

}

function addUnboughtStyles(selectedProduct,boughtButton, productSummaryItem ) {
    boughtButton.textContent = 'Не куплено';
    boughtButton.classList.add('button_panel__bought_button_not');

    selectedProduct.querySelector('.selected-product__name').classList.add('selected-product__name_bought');
    selectedProduct.querySelector('.count-panel__minus').classList.add('count-panel__button_bought');
    selectedProduct.querySelector('.count-panel__plus').classList.add('count-panel__button_bought');
    selectedProduct.querySelector('.button_panel__canceled_button').classList.add('button_panel__canceled_button_bought');

    productSummaryItem.querySelector('.products-summary__product-name').classList.add('products-summary__product-name_bought');
    productSummaryItem.querySelector('.products-summary__product-quantity').classList.add('products-summary__product-quantity_bought');

    const boughtProductSummaryList = purchaseInfo.querySelector('.products-summary__list_bottom');
    boughtProductSummaryList.appendChild(productSummaryItem); 
}


function increaseQuantityOfCreatedProduct() {
    const createdProduct = this.closest('.selected-product'); 
    const productName = createdProduct.querySelector('.selected-product__name').textContent;

    let products = getProductsFromLocalStorage();
    let productFromLocalStorage = products.find(
        product => product.name.toLocaleLowerCase() === productName.toLocaleLowerCase()
    );

    productFromLocalStorage.quantity++;
    if(productFromLocalStorage.quantity === 2)
        createdProduct.querySelector('.count-panel__minus').classList.remove('count-panel__minus_one');
    setProductsToLocalStorage(products);

    const quantityPanel = createdProduct.querySelector(".count-panel__count");
    quantityPanel.textContent = productFromLocalStorage.quantity;

    const productSummary = getProductSummaryItemByName(productName);
    productSummary.querySelector('.products-summary__product-quantity').textContent = productFromLocalStorage.quantity;
}

function decreaseQuantityOfCreatedProduct() {
    const createdProduct = this.closest('.selected-product'); 
    const productName = createdProduct.querySelector('.selected-product__name').textContent;

    let products = getProductsFromLocalStorage();
    let productFromLocalStorage = products.find(
        product => product.name.toLocaleLowerCase() === productName.toLocaleLowerCase()
    );

    if(productFromLocalStorage.quantity > 1)
        productFromLocalStorage.quantity--;
    if(productFromLocalStorage.quantity === 1)
        createdProduct.querySelector('.count-panel__minus').classList.add('count-panel__minus_one');

    setProductsToLocalStorage(products);

    const quantityPanel = createdProduct.querySelector(".count-panel__count");
    quantityPanel.textContent = productFromLocalStorage.quantity;

    const productSummary = getProductSummaryItemByName(productName);
    productSummary.querySelector('.products-summary__product-quantity').textContent = productFromLocalStorage.quantity;
}


function existNameInProductList(enteredProductName){
    return getProductsFromLocalStorage().some(
        item => item.name.toLocaleLowerCase() === enteredProductName.toLocaleLowerCase()
    );
}


addProductButton.addEventListener('click', addProduct);
input.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') {
        addProduct();
    }
}  );


init();