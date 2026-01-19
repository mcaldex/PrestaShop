// Import utils
import testContext from '@utils/testContext';

// Import common tests
import {enableTheme, disableTheme} from '@commonTests/BO/design/hummingbird';
import setFeatureFlag from '@commonTests/BO/advancedParameters/newFeatures';
import {deleteProductTest} from "@commonTests/BO/catalog/product";

import {
  type BrowserContext,
  dataCarriers,
  dataProducts,
  dataCustomers,
  dataAddresses,
  dataPaymentMethods,
  dataOrderStatuses,
  FakerProduct,
  FakerOrder,
  FakerCarrier,
  dataZones,
  foHummingbirdCartPage,
  foHummingbirdCheckoutPage,
  foHummingbirdHomePage,
  foHummingbirdProductPage,
  boFeatureFlagPage,
  boLoginPage,
  boDashboardPage,
  boCarriersPage,
  boCarriersCreatePage,
  boProductsPage,
  boProductsCreatePage,
  boProductsCreateTabShippingPage,
  type Page,
  utilsPlaywright,
  utilsFile,
} from '@prestashop-core/ui-testing';

import {expect} from 'chai';
import {boOrderSettingsPage} from "@prestashop-core/ui-testing";
import {utilsCore} from "@prestashop-core/ui-testing";
import {foHummingbirdSearchResultsPage} from "@prestashop-core/ui-testing";
import {foHummingbirdLoginPage} from "@prestashop-core/ui-testing";
import {foHummingbirdCheckoutOrderConfirmationPage} from "@prestashop-core/ui-testing";
import {foHummingbirdModalQuickViewPage} from "@prestashop-core/ui-testing";
import {foHummingbirdModalBlockCartPage} from "@prestashop-core/ui-testing";

const baseContext: string = 'functional_FO_hummingbird_checkout_shippingMethods_multicarrier';

/*
Pre-condition:
- Enable multiCarrier
- Create 2 carriers
- Create 3 product
- Enable Hummingbird
- Enable final summary
Scenario:

Post-condition:
- Disable multiCarrier
- Delete products
- Delete carriers
- Disable Hummingbird
- Disable final summary
 */

describe('FO - Checkout - Shipping methods : MultiCarrier', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  const firstCarrierData: FakerCarrier = new FakerCarrier({
    // General settings
    name: 'Carrier for product 1',
    speedGrade: 7,
    // Shipping locations and cost
    handlingCosts: false,
    freeShipping: true,
    ranges: [
      {
        weightMin: 0,
        weightMax: 5,
        zones: [
          {
            zone: dataZones.europe,
            price: 5,
          },
          {
            zone: dataZones.northAmerica,
            price: 2,
          },
        ],
      },
    ],
    // Size weight and group access
    maxWidth: 200,
    maxHeight: 200,
    maxDepth: 200,
    maxWeight: 500,
    enable: true,
  });
  const secondCarrierData: FakerCarrier = new FakerCarrier({
    // General settings
    name: 'Carrier for product 2 and 3',
    speedGrade: 7,
    // Shipping locations and cost
    handlingCosts: false,
    freeShipping: true,
    ranges: [
      {
        weightMin: 0,
        weightMax: 5,
        zones: [
          {
            zone: dataZones.europe,
            price: 5,
          },
          {
            zone: dataZones.northAmerica,
            price: 2,
          },
        ],
      },
    ],
    // Size weight and group access
    maxWidth: 200,
    maxHeight: 200,
    maxDepth: 200,
    maxWeight: 500,
    enable: true,
  });

  const firstProductData: FakerProduct = new FakerProduct({
    name: 'First product',
    price: 10.95,
    taxRule: 'No tax',
    quantity: 20,
    type: 'standard',
    status: true,
    packageDimensionWeight: 2,
  });
  const secondProductData: FakerProduct = new FakerProduct({
    name: 'Second product',
    price: 15.55,
    taxRule: 'No tax',
    quantity: 20,
    type: 'standard',
    status: true,
    packageDimensionWeight: 2,
  });
  const thirdProductData: FakerProduct = new FakerProduct({
    name: 'Third product',
    price: 30.55,
    taxRule: 'No tax',
    quantity: 20,
    type: 'standard',
    status: true,
    packageDimensionWeight: 2,
  });
  const productVData: FakerProduct = new FakerProduct({
    name: 'Virtual product',
    price: 10,
    taxRule: 'No tax',
    quantity: 20,
    type: 'virtual',
    status: true,
  });

  const orderData: FakerOrder = new FakerOrder({
    customer: dataCustomers.johnDoe,
    products: [
      {
        product: firstProductData,
        quantity: 3,
      },
      {
        product: secondProductData,
        quantity: 4,
      },
      {
        product: thirdProductData,
        quantity: 2,
      },
      {
        product: productVData,
        quantity: 2,
      },
    ],
    deliveryAddress: dataAddresses.address_2,
    invoiceAddress: dataAddresses.address_2,
    deliveryOption: {
      name: `${firstCarrierData.name} - ${firstCarrierData.transitName}`,
      freeShipping: true,
    },
    paymentMethod: dataPaymentMethods.cashOnDelivery,
    status: dataOrderStatuses.paymentAccepted,
  });

  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);

    // Create images
    await Promise.all([
      utilsFile.generateImage(`${firstCarrierData.name}.jpg`),
      utilsFile.generateImage(`${secondCarrierData.name}.jpg`),
    ]);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);

    /* Delete the generated images */
    await Promise.all([
      utilsFile.deleteFile(`${firstCarrierData.name}.jpg`),
      utilsFile.deleteFile(`${secondCarrierData.name}.jpg`),
    ]);
  });

  // 1 - Pre-condition: Enable improved_shipment
  /*setFeatureFlag(boFeatureFlagPage.featureFlagImprovedShipment, true, `${baseContext}_preTest`);

  // 2 - Pre-condition: Create 2 carriers
  describe('Pre-condition: Create 2 carriers', async () => {
    it('should login in BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'loginBO', baseContext);

      await boLoginPage.goTo(page, global.BO.URL);
      await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);

      const pageTitle = await boDashboardPage.getPageTitle(page);
      expect(pageTitle).to.contains(boDashboardPage.pageTitle);
    });

    it('should go to \'Shipping > Carriers\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToCarriersPage', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.shippingLink,
        boDashboardPage.carriersLink,
      );

      const pageTitle = await boCarriersPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCarriersPage.pageTitle);
    });

    it('should go to add new carrier page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAddCarrierPage', baseContext);

      await boCarriersPage.goToAddNewCarrierPage(page);

      const pageTitle = await boCarriersCreatePage.getPageTitle(page);
      expect(pageTitle).to.contains(boCarriersCreatePage.pageTitleCreate);
    });

    it('should create the first carrier and check result', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createCarrier', baseContext);

      const textResult = await boCarriersCreatePage.createEditCarrier(page, firstCarrierData);
      expect(textResult).to.contains(boCarriersPage.successfulCreationMessage);
    });

    it('should go to \'Shipping > Carriers\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToCarriersPage2', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.shippingLink,
        boDashboardPage.carriersLink,
      );

      const pageTitle = await boCarriersPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCarriersPage.pageTitle);
    });

    it('should go to add new carrier page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAddCarrierPage2', baseContext);

      await boCarriersPage.goToAddNewCarrierPage(page);

      const pageTitle = await boCarriersCreatePage.getPageTitle(page);
      expect(pageTitle).to.contains(boCarriersCreatePage.pageTitleCreate);
    });

    it('should create the second carrier and check result', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createCarrier2', baseContext);

      const textResult = await boCarriersCreatePage.createEditCarrier(page, secondCarrierData);
      expect(textResult).to.contains(boCarriersPage.successfulCreationMessage);
    });
  });

  // 3 - Pre-condition: Create 4 products
  describe('Pre-condition: Create 4 products', async () => {
    it('should go to \'Catalog > Products\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToProductsPage', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.catalogParentLink,
        boDashboardPage.productsLink,
      );

      await boProductsPage.closeSfToolBar(page);

      const pageTitle = await boProductsPage.getPageTitle(page);
      expect(pageTitle).to.contains(boProductsPage.pageTitle);
    });

    it('should click on \'New product\' button and check new product modal', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNewProductButton', baseContext);

      const isModalVisible = await boProductsPage.clickOnNewProductButton(page);
      expect(isModalVisible).to.equals(true);
    });

    it('should choose \'Standard product\' and go to new product page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'chooseStandardProduct', baseContext);

      await boProductsPage.selectProductType(page, firstProductData.type);
      await boProductsPage.clickOnAddNewProduct(page);

      const pageTitle = await boProductsCreatePage.getPageTitle(page);
      expect(pageTitle).to.contains(boProductsCreatePage.pageTitle);
    });

    it('should create standard product', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createStandardProduct', baseContext);

      const createProductMessage = await boProductsCreatePage.setProduct(page, firstProductData);
      expect(createProductMessage).to.equal(boProductsCreatePage.successfulUpdateMessage);
    });

    it('should go to shipping tab and set package dimension', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'editPackageDimension', baseContext);

      await boProductsCreateTabShippingPage.setPackageDimension(page, firstProductData);

      const message = await boProductsCreatePage.saveProduct(page);
      expect(message).to.eq(boProductsCreatePage.successfulUpdateMessage);
    });

    it('should select the first created carrier', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'selectFirstCarrier', baseContext);

      await boProductsCreateTabShippingPage.selectAvailableCarrier(page, 5);

      const message = await boProductsCreatePage.saveProduct(page);
      expect(message).to.eq(boProductsCreatePage.successfulUpdateMessage);
    });

    it('should duplicate the product', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'duplicateProduct', baseContext);

      const textMessage = await boProductsCreatePage.duplicateProduct(page);
      expect(textMessage).to.equal(boProductsCreatePage.successfulDuplicateMessage);
    });

    it('should edit the duplicated product', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'editSecondProduct', baseContext);

      const createProductMessage = await boProductsCreatePage.setProduct(page, secondProductData);
      expect(createProductMessage).to.equal(boProductsCreatePage.successfulUpdateMessage);
    });

    it('should go to shipping tab and edit package dimension', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'editPackageDimension2', baseContext);

      await boProductsCreateTabShippingPage.setPackageDimension(page, secondProductData);

      const message = await boProductsCreatePage.saveProduct(page);
      expect(message).to.eq(boProductsCreatePage.successfulUpdateMessage);
    });

    it('should select the second created carrier', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'selectSecondCarrier2', baseContext);

      await boProductsCreateTabShippingPage.clearChoiceCarrier(page);
      await boProductsCreateTabShippingPage.selectAvailableCarrier(page, 6);

      const message = await boProductsCreatePage.saveProduct(page);
      expect(message).to.eq(boProductsCreatePage.successfulUpdateMessage);
    });

    it('should duplicate the second product', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'duplicateProduct2', baseContext);

      const textMessage = await boProductsCreatePage.duplicateProduct(page);
      expect(textMessage).to.equal(boProductsCreatePage.successfulDuplicateMessage);
    });

    it('should edit the second duplicated product', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'editThirdProduct', baseContext);

      const createProductMessage = await boProductsCreatePage.setProduct(page, thirdProductData);
      expect(createProductMessage).to.equal(boProductsCreatePage.successfulUpdateMessage);
    });

    it('should select the first and second created carrier', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'selectSecondCarrier', baseContext);

      await boProductsCreateTabShippingPage.setPackageDimension(page, secondProductData);
      await boProductsCreateTabShippingPage.selectAvailableCarrier(page, 5);

      const message = await boProductsCreatePage.saveProduct(page);
      expect(message).to.eq(boProductsCreatePage.successfulUpdateMessage);
    });
  });

  // 4 - Enable final summary
  describe('Pre-condition: Enable final summary', async () => {
    it('should go to \'Shop Parameters > Order Settings\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToOrderSettingsPage', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.shopParametersParentLink,
        boDashboardPage.orderSettingsLink,
      );
      await boOrderSettingsPage.closeSfToolBar(page);

      const pageTitle = await boOrderSettingsPage.getPageTitle(page);
      expect(pageTitle).to.contains(boOrderSettingsPage.pageTitle);
    });

    it('should enable final summary', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'enableFinalSummary', baseContext);

      const result = await boOrderSettingsPage.setFinalSummaryStatus(page, true);
      expect(result).to.contains(boOrderSettingsPage.successfulUpdateMessage);
    });
  });

  // 5 - Pre-condition : Install Hummingbird
  enableTheme('hummingbird', `${baseContext}_preTest_0`);*/

  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
  });

  describe('Create order and check multicarrier', async () => {
    it('should go to FO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToFO', baseContext);

      await foHummingbirdHomePage.goToFo(page);

      const isHomePage = await foHummingbirdHomePage.isHomePage(page);
      expect(isHomePage).to.eq(true);
    });

    it('should go to login page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToLoginPageFO', baseContext);

      await foHummingbirdHomePage.goToLoginPage(page);

      const pageTitle = await foHummingbirdLoginPage.getPageTitle(page);
      expect(pageTitle, 'Fail to open FO login page').to.contains(foHummingbirdLoginPage.pageTitle);
    });

    it('should sign in with customer credentials', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'signInFO', baseContext);

      await foHummingbirdLoginPage.customerLogin(page, orderData.customer);

      const isCustomerConnected = await foHummingbirdLoginPage.isCustomerConnected(page);
      expect(isCustomerConnected, 'Customer is not connected').to.eq(true);
    });

    [
      {args: {productData: orderData.products[0]}},
      {args: {productData: orderData.products[1]}},
      {args: {productData: orderData.products[2]}},
      {args: {productData: orderData.products[3]}},
    ].forEach((test, index) => {
      it(`should add the product '${test.args.productData.product.name}' to cart`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `addProductToCart${index}`, baseContext);

        // Go to home page
        await foHummingbirdLoginPage.goToHomePage(page);
        await foHummingbirdHomePage.searchProduct(page, test.args.productData.product.name);
        await foHummingbirdModalQuickViewPage.setQuantityAndAddToCart(page, test.args.productData.product.quantity);
      });

      it('should click on continue shopping and check that the modal is not visible', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `clickOnContinueShopping${index}`, baseContext);

        const isNotVisible = await foHummingbirdModalBlockCartPage.continueShopping(page);
        expect(isNotVisible).to.eq(true);
      });
    });

    it('should check the cart notifications number', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkNotificationsNumber', baseContext);

      const notificationsNumber = await foHummingbirdHomePage.getCartNotificationsNumber(page);
      expect(notificationsNumber).to.equal(11);
    });

    it('should proceed to checkout and go to checkout page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'proceedToCheckout', baseContext);

      await foHummingbirdCartPage.clickOnProceedToCheckout(page);

      const isCheckoutPage = await foHummingbirdCheckoutPage.isCheckoutPage(page);
      expect(isCheckoutPage).to.eq(true);
    });

    it('should go to delivery step', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToDeliveryStep', baseContext);

      // Proceed to checkout the shopping cart
      await foHummingbirdCartPage.clickOnProceedToCheckout(page);

      // Address step - Go to delivery step
      const isStepAddressComplete = await foHummingbirdCheckoutPage.goToDeliveryStep(page);
      expect(isStepAddressComplete, 'Step Address is not complete').to.eq(true);
    });

    it('should check the first carrier data', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkFirstCarrierData', baseContext);

      const carrierData = await foHummingbirdCheckoutPage.getCarrierData(page, 1);
      console.log(carrierData.name);
      console.log(carrierData.transitName);
      console.log(carrierData.priceText);

      /*await Promise.all([
        expect(carrierData.name).to.equal(dataCarriers.clickAndCollect.name),
        expect(carrierData.transitName).to.equal(dataCarriers.clickAndCollect.transitName),
        expect(carrierData.priceText).to.equal('Free'),
      ]);*/
    });

    it('should go to payment step', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToPaymentStep', baseContext);

      // Delivery step - Go to payment step
      const isStepDeliveryComplete = await foHummingbirdCheckoutPage.goToPaymentStep(page);
      expect(isStepDeliveryComplete, 'Step Address is not complete').to.eq(true);
    });

    it('should choose payment method and confirm the order', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'confirmOrder', baseContext);

      // Payment step - Choose payment step
      await foHummingbirdCheckoutPage.choosePaymentAndOrder(page, orderData.paymentMethod.moduleName);

      // Check the confirmation message
      const cardTitle = await foHummingbirdCheckoutOrderConfirmationPage.getOrderConfirmationCardTitle(page);
      expect(cardTitle).to.contains(foHummingbirdCheckoutOrderConfirmationPage.orderConfirmationCardTitle);
    });
  });

  // 1 - Post-condition: Disable improved_shipment
  /*setFeatureFlag(boFeatureFlagPage.featureFlagImprovedShipment, false, `${baseContext}_postTest_1`);

  // 2 - Post-condition: Delete created products
  [
    {args: {testIdentifier: 'postTest_2', productData: firstProductData}},
    {args: {testIdentifier: 'postTest_3', productData: secondProductData}},
    {args: {testIdentifier: 'postTest_4', productData: thirdProductData}},
  ].forEach((test) => {
    deleteProductTest(test.args.productData, `${baseContext}${test.args.testIdentifier}`);
  });

  // 3 - Post-condition: Delete created carriers
  describe('Post-condition: Delete created carriers', async () => {
    it('should go to \'Shipping > Carriers\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToCarriersPage3', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.shippingLink,
        boDashboardPage.carriersLink,
      );

      const pageTitle = await boCarriersPage.getPageTitle(page);
      expect(pageTitle).to.contains(boCarriersPage.pageTitle);
    });
    [
      {args: {carrier: firstCarrierData}},
      {args: {carrier: secondCarrierData}},
    ].forEach((test, index) => {
      it('should filter list by name', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `filterCarriersForDelete${index}`, baseContext);

        await boCarriersPage.resetFilter(page);
        await boCarriersPage.filterTable(page, 'input', 'name', test.args.carrier.name);

        const carrierName = await boCarriersPage.getTextColumn(page, 1, 'name');
        expect(carrierName).to.contains(test.args.carrier.name);
      });

      it('should delete carrier', async function () {
        await testContext.addContextItem(this, 'testIdentifier', `deleteCarrier${index}`, baseContext);

        const textResult = await boCarriersPage.deleteCarrier(page, 1);
        expect(textResult).to.contains(boCarriersPage.successfulDeleteMessage);
        await boCarriersPage.resetFilter(page);
      });
    });
  });

  // 4 - Post-condition: Disable final summary
  describe('Post-condition: Disable final summary', async ()=> {
    it('should go to \'Shop Parameters > Order Settings\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToOrderSettingsPage', baseContext);

      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.shopParametersParentLink,
        boDashboardPage.orderSettingsLink,
      );
      await boOrderSettingsPage.closeSfToolBar(page);

      const pageTitle = await boOrderSettingsPage.getPageTitle(page);
      expect(pageTitle).to.contains(boOrderSettingsPage.pageTitle);
    });

    it('should disable final summary', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'disableFinalSummary', baseContext);

      const result = await boOrderSettingsPage.setFinalSummaryStatus(page, true);
      expect(result).to.contains(boOrderSettingsPage.successfulUpdateMessage);
    });
  });

  // 5 - Post-condition : Uninstall Hummingbird
  disableTheme('hummingbird', `${baseContext}_postTest_2`);*/
});
