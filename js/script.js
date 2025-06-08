let products = [
    { id: 1, name: 'Помідори', quantity: 1, bought: false },
    { id: 2, name: 'Печиво', quantity: 1, bought: false },
    { id: 3, name: 'Сир', quantity: 1, bought: false }
];


const productList = document.querySelector('.selected-product-list');
const addButton = document.querySelector('.add-panel__button');
const addInput = document.querySelector('.add-panel__input');
const purchaseInfo = document.querySelector('.purchase-info');

function init() {
    updateProductList();
    updateStatistics();


    addButton.addEventListener('click', handleAddProduct);
    addInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleAddProduct();
    });
}


function updateProductList() {
    while (productList.children.length > 1) {
        productList.removeChild(productList.lastChild);
    }

    products.forEach(product => {
        const productElement = createProductElement(product);
        productList.appendChild(productElement);
    });
}

function createProductElement(product) {
    const li = document.createElement('li');
    li.className = 'selected-product-list__item selected-product';
    li.dataset.id = product.id;


    const nameElement = document.createElement(product.bought ? 'p' : 'div');
    nameElement.className = `selected-product__name ${product.bought ? 'selected-product__name_bought' : ''}`;

    if (product.bought) {
        nameElement.textContent = product.name;
    } else {
        nameElement.textContent = product.name;
        nameElement.addEventListener('click', () => editProductName(product.id, nameElement));
    }


    const countPanel = document.createElement('div');
    countPanel.className = 'count-panel';

    const minusButton = document.createElement('button');
    minusButton.className = `count-panel__minus count-panel__button ${product.quantity === 1 ? 'count-panel__minus_one' : ''} ${product.bought ? 'count-panel__button_bought' : ''}`;
    minusButton.innerHTML = '<i class="fa fa-minus" aria-hidden="true"></i>';
    minusButton.setAttribute('aria-label', 'Зменшити кількість');
    minusButton.setAttribute('data-tooltip', 'Зменшити кількість');
    if (!product.bought) {
        minusButton.addEventListener('click', () => decreaseQuantity(product.id));
    }

    const countSpan = document.createElement('span');
    countSpan.className = 'count-panel__count';
    countSpan.textContent = product.quantity;

    const plusButton = document.createElement('button');
    plusButton.className = `count-panel__plus count-panel__button ${product.bought ? 'count-panel__button_bought' : ''}`;
    plusButton.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>';
    plusButton.setAttribute('aria-label', 'Збільшити кількість');
    plusButton.setAttribute('data-tooltip', 'Збільшити кількість');
    if (!product.bought) {
        plusButton.addEventListener('click', () => increaseQuantity(product.id));
    }

    countPanel.appendChild(minusButton);
    countPanel.appendChild(countSpan);
    countPanel.appendChild(plusButton);

    const buttonPanel = document.createElement('div');
    buttonPanel.className = 'button_panel';

    const boughtButton = document.createElement('button');
    boughtButton.className = `button_panel__bought_button ${product.bought ? 'button_panel__bought_button_not' : ''}`;
    boughtButton.textContent = product.bought ? 'Не куплено' : 'Куплено';
    boughtButton.setAttribute('data-tooltip', product.bought ? 'Продовжити покупку' : 'Купити товар');
    boughtButton.addEventListener('click', () => toggleBoughtStatus(product.id));

    const deleteButton = document.createElement('button');
    deleteButton.className = `button_panel__canceled_button ${product.bought ? 'button_panel__canceled_button_bought' : ''}`;
    deleteButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
    deleteButton.setAttribute('aria-label', 'Видалити товар');
    deleteButton.setAttribute('data-tooltip', 'Видалити товар');
    if (!product.bought) {
        deleteButton.addEventListener('click', () => deleteProduct(product.id));
    }

    buttonPanel.appendChild(boughtButton);
    buttonPanel.appendChild(deleteButton);

    li.appendChild(nameElement);
    li.appendChild(countPanel);
    li.appendChild(buttonPanel);

    return li;
}

function handleAddProduct() {
    const productName = addInput.value.trim();

    if (!productName) {
        alert('Будь ласка, введіть назву товару');
        return;
    }

    if (isProductNameExists(productName)) {
        alert('Товар з такою назвою вже є у списку');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: productName,
        quantity: 1,
        bought: false
    };

    products.push(newProduct);
    updateProductList();
    updateStatistics();
    addInput.value = '';
    addInput.focus();
}

function isProductNameExists(name) {
    return products.some(
        product => product.name.toLowerCase() === name.toLowerCase()
    );
}

function increaseQuantity(id) {
    const product = products.find(p => p.id === id);
    if (product && !product.bought) {
        product.quantity++;
        updateProductList();
        updateStatistics();
    }
}

function decreaseQuantity(id) {
    const product = products.find(p => p.id === id);
    if (product && !product.bought && product.quantity > 1) {
        product.quantity--;
        updateProductList();
        updateStatistics();
    }
}

function toggleBoughtStatus(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        product.bought = !product.bought;
        updateProductList();
        updateStatistics();
    }
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    updateProductList();
    updateStatistics();
}

function editProductName(id, nameElement) {
    const product = products.find(p => p.id === id);
    if (!product || product.bought) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input_product';
    input.value = product.name;

    nameElement.textContent = '';
    nameElement.appendChild(input);
    input.focus();

    let isSaving = false; 

    const saveName = () => {
        if (isSaving) return; 
        isSaving = true;
        
        const newName = input.value.trim();
        
        if (!newName) {
            nameElement.textContent = product.name;
            return;
        }
        
        if (isProductNameExists(newName) && newName.toLowerCase() !== product.name.toLowerCase()) {
            alert('Товар з такою назвою вже є у списку');
            nameElement.textContent = product.name;
            return;
        }
        
        if (newName !== product.name) {
            product.name = newName;
            updateProductList();
            updateStatistics();
        } else {
            nameElement.textContent = product.name;
        }
    };

    input.addEventListener('blur', saveName);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveName();
            input.blur(); 
        }
    });
}

function updateStatistics() {
    const notBoughtProducts = products.filter(p => !p.bought);
    const boughtProducts = products.filter(p => p.bought);

    while (purchaseInfo.firstChild) {
        purchaseInfo.removeChild(purchaseInfo.firstChild);
    }

    const leftSection = document.createElement('section');
    leftSection.className = 'products-summary';

    const leftHeader = document.createElement('h2');
    leftHeader.className = 'products-summary__name products-summary__name_top';
    leftHeader.textContent = 'Залишилося';

    const leftList = document.createElement('ul');
    leftList.className = 'products-summary__list';

    notBoughtProducts.forEach(product => {
        const item = document.createElement('li');
        item.className = 'products-summary__product';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'products-summary__product-name';
        nameSpan.textContent = product.name;
        nameSpan.style.marginRight = '10px'; 

        const quantitySpan = document.createElement('span');
        quantitySpan.className = 'products-summary__product-quantity';
        quantitySpan.textContent = product.quantity;

        item.appendChild(nameSpan);
        item.appendChild(quantitySpan);
        leftList.appendChild(item);
    });

    leftSection.appendChild(leftHeader);
    leftSection.appendChild(leftList);

    const boughtSection = document.createElement('section');
    boughtSection.className = 'products-summary';

    const boughtHeader = document.createElement('h2');
    boughtHeader.className = 'products-summary__name';
    boughtHeader.textContent = 'Куплено';

    const boughtList = document.createElement('ul');
    boughtList.className = 'products-summary__list products-summary__list_bottom';

    boughtProducts.forEach(product => {
        const item = document.createElement('li');
        item.className = 'products-summary__product';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'products-summary__product-name products-summary__product-name_bought';
        nameSpan.textContent = product.name;
        nameSpan.style.marginRight = '10px'; 

        const quantitySpan = document.createElement('span');
        quantitySpan.className = 'products-summary__product-quantity products-summary__product-quantity_bought';
        quantitySpan.textContent = product.quantity;

        item.appendChild(nameSpan);
        item.appendChild(quantitySpan);
        boughtList.appendChild(item);
    });

    boughtSection.appendChild(boughtHeader);
    boughtSection.appendChild(boughtList);

    purchaseInfo.appendChild(leftSection);
    purchaseInfo.appendChild(boughtSection);
}

init();