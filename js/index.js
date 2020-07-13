class App {
  //parameters
  minConsumption = 10;
  maxConsumption = 500;
  index = 0;
  eventHandler = false;

  //instalation cost per panel
  panelCost = 120;

  //instalation cost per 0.1 kWh
  kwhCost = 460;

  //panel size in m2 for flat
  panelSizeFlat = 2.2;

  //panel size in m2 for ns
  panelSizeNs = 1.6;

  //panel size in m2 for ew
  panelSizeEw = 1.6;

  //add panel per kWh
  addpanelKwInEw = 1.12;

  //elements
  buttonPrev = null;
  buttonNext = null;
  slickIndexes = [];
  dataRoofs = [];
  content = null;
  dataSlick = null;
  slickSlide = null;
  currentIndex = null;
  calculatorRange = 10;
  calculatorText = null;
  dataFill = null;
  dataContainer = null;
  resultCalculation = null;
  dataCost = null;

  DOMElements = {
    buttonPrev: "[data-prev-button]",
    buttonNext: "[data-next-button]",
    slickIndexes: "[data-slick-index]",
    content: "[data-content]",
    slickSlide: "[data-slick]",
    currentIndex: "[data-steper-list]",
    calculatorRange: "steps__calculator-range",
    calculatorText: "steps__calculator-text",
    dataFill: "data-fill",
    dataRoofs: "[data-roof]",
    dataContainer: "[data-calculation-container]",
    resultCalculation: "[data-calculation-container]",
    dataCost: "[data-cost]",
  };

  initializeApp() {
    this.handleElements();
    this.setInitialValues();
    this.addEventListeners();

    const height = this.slickIndexes[this.index].offsetHeight;
    this.slickSlide.style.height = height + "px";
  }

  handleElements() {
    const {
      buttonPrev,
      buttonNext,
      slickIndexes,
      content,
      slickSlide,
      currentIndex,
      calculatorRange,
      calculatorText,
      dataFill,
      dataRoofs,
      dataContainer,
      dataCost,
    } = this.DOMElements;

    this.buttonPrev = document.querySelector(buttonPrev);
    this.buttonNext = document.querySelector(buttonNext);
    this.slickIndexes = document.querySelectorAll(slickIndexes);
    this.content = document.querySelector(content);
    this.slickSlide = document.querySelector(slickSlide);
    this.currentIndex = document.querySelectorAll(currentIndex);
    this.calculatorRange = document.getElementById(calculatorRange);
    this.calculatorText = document.getElementById(calculatorText);
    this.dataFill = document.getElementById(dataFill);
    this.dataRoofs = document.querySelectorAll(dataRoofs);
    this.dataContainer = document.querySelector(dataContainer);
    this.dataCost = document.querySelector(dataCost);
  }

  addEventListeners() {
    const liList = [...this.currentIndex[0].children];

    this.buttonNext.addEventListener("click", () =>
      this.buttonClick("next", liList)
    );
    this.buttonPrev.addEventListener("click", () =>
      this.buttonClick("prev", liList)
    );
    this.calculatorRange.addEventListener("input", () => this.rangeSlider());
    liList.forEach((li) => {
      li.addEventListener("click", () => this.steperClick(li, liList));
    });
    window.addEventListener("resize", () => this.resizeStyle());
  }

  //min, max
  setInitialValues() {
    this.calculatorRange.min = this.minConsumption;
    this.calculatorRange.max = this.maxConsumption;
    this.calculatorText.innerHTML = this.calculatorRange.value;
  }

  //range slider style background
  rangeSlider() {
    const maxRange = this.maxConsumption / 100;
    const width = this.calculatorRange.value / maxRange - 100;
    const value = this.calculatorRange.value;

    this.calculatorText.innerHTML = value;
    this.dataFill.style.transform = "translateX(" + width + "%" + ")";
  }

  //prev and next button
  buttonClick(type, liList) {
    if (type === "next" && !this.eventHandler) {
      this.eventHandler = true;
      if (this.index < 3) {
        this.index++;
        this.clickAnimation();
        this.steperChange(liList);
      }

      this.setOpacityAndDelay();
    }

    if (type === "prev" && !this.eventHandler) {
      this.eventHandler = true;
      if (this.index > 0) {
        this.index--;
        this.clickAnimation();
        this.steperChange(liList);
      }

      this.setOpacityAndDelay();
    }

    if (type === "next" && this.index === 2) {
      this.countCalculation();
    }

    if (type === "next" && this.index === 3) {
      this.countCost();
    }
  }

  countCalculation() {
    const roofType = this.whatChecked();
    const powerInstallation = this.getPowerInstallation();
    const panelCount = this.getPanelCount();
    const save = this.calculatorRange.value * 12;
    const roofSize = this.size(panelCount);
    const { resultCalculation } = this.DOMElements;
    const previousResult = document.querySelector(resultCalculation);

    if (previousResult) {
      previousResult.remove();
    }

    this.slickIndexes[2].insertAdjacentHTML(
      "afterbegin",
      this.createCalculationTemplate(
        powerInstallation,
        panelCount,
        roofSize,
        save,
        roofType
      )
    );
  }

  countCost() {
    const costChildren = this.dataCost.children[0];
    const costInstalation = this.getCostInstalation();

    if (costChildren) {
      costChildren.remove();
    }

    this.dataCost.insertAdjacentHTML(
      "afterbegin",
      this.createCostTemplate(costInstalation)
    );
  }

  createCostTemplate(costInstalation) {
    return `
      <span class="steps__four-span">${costInstalation + " zł"}</span>
    `;
  }

  getCostInstalation() {
    const powerInstallation = this.getPowerInstallation();
    const panelCount = this.getPanelCount();

    return (
      powerInstallation * this.kwhCost * 10 +
      panelCount * this.panelCost
    ).toFixed(0);
  }

  //create step 3
  createCalculationTemplate(
    powerInstallation,
    panelCount,
    roofSize,
    save,
    roofType
  ) {
    const count =
      roofType === "ew"
        ? Math.round(panelCount * this.addpanelKwInEw)
        : panelCount;

    return `
      <div class="steps__three-container" data-calculation-container>
        <p class="steps__three-paragraph">
          Prognozowana moc Twojej instalacji fotowoltaicznej:
          <span class="steps__three-span">${powerInstallation}</span> KW
        </p>
        <p class="steps__three-paragraph">
          Liczba potrzebnych paneli:
          <span class="steps__three-span">${count}</span>
        </p>
        <p class="steps__three-paragraph">
          Powierzchnia dachu:
          <span class="steps__three-span">${roofSize}</span> m<sup>2</sup>
        </p>
        <p class="steps__three-paragraph">
          Dzięki własnej elektrowni słonecznej zaoszczędzisz
          <span class="steps__three-span">${save}</span> zł / rocznie
        </p>
      </div>
    `;
  }

  getPowerInstallation() {
    const rangeSliderValue = this.calculatorRange.value;
    const howManyTen = (parseInt(rangeSliderValue) / 10) * 0.2;
    const howManyHundred = parseInt(rangeSliderValue) / 100 / 5;

    return Number(Math.round(howManyTen - howManyHundred + "e+1") + "e-1");
  }

  getPanelCount() {
    const rangeSliderValue = this.calculatorRange.value;
    const howManyTen = parseInt(rangeSliderValue) / 10;
    const howManyHundred = parseInt(rangeSliderValue) / 100;

    return Math.round(howManyTen - howManyHundred * 4);
  }

  //roof type selected
  whatChecked() {
    const roofs = [...this.dataRoofs];
    let checkedValue = "";

    roofs.forEach((input) => {
      if (input.checked) {
        checkedValue = input.value;
      }
    });

    return checkedValue;
  }

  //panel size on roof
  size(panelCount) {
    const roofType = this.whatChecked();
    let number = 0;

    if (roofType === "flat") {
      number = panelCount * this.panelSizeFlat;
    }

    if (roofType === "ns") {
      number = panelCount * this.panelSizeNs;
    }

    if (roofType === "ew") {
      let value = Math.round(panelCount * this.addpanelKwInEw);
      number = value * this.panelSizeEw;
    }

    return Math.round(number);
  }

  //set opacity to bottom when user chenage step and set delay
  setOpacityAndDelay() {
    if (this.index !== 0) {
      this.buttonPrev.classList.remove("button--prev-opacity");
    } else {
      this.buttonPrev.classList.add("button--prev-opacity");
    }

    if (this.index !== this.slickIndexes.length - 1) {
      this.buttonNext.classList.remove("button--prev-opacity");
    } else {
      this.buttonNext.classList.add("button--prev-opacity");
    }

    setTimeout(() => this.delayStepper(), 600);
  }

  delayStepper() {
    this.eventHandler = false;
  }

  //steper list click event
  steperClick(li, liList) {
    if (!this.eventHandler) {
      const stepIndex = li.dataset.stepGo;
      const content = [...this.content.children];

      this.index = parseInt(stepIndex);
      this.currentIndex[0].dataset.steperList = stepIndex;
      this.eventHandler = true;

      liList.forEach((element, index) => {
        if (index !== stepIndex) {
          element.children[0].classList.remove("item-btn--active");
          element.children[1].classList.remove("item-span--active");
        }
      });

      li.children[0].classList.add("item-btn--active");
      li.children[1].classList.add("item-span--active");

      content.forEach((element, index) => {
        if (element.dataset.slickIndex === stepIndex) {
          const left = this.slickIndexes[index].offsetLeft;
          const height = this.slickIndexes[index].offsetHeight;

          this.content.setAttribute(
            "style",
            "transform: translateX(-" +
              left +
              "px); transition: transform 0.6s ease"
          );

          this.slickSlide.style.height = height + "px";
        }
      });

      this.setOpacityAndDelay();
    }

    if (this.index === 2) {
      this.countCalculation();
    }

    if (this.index === 3) {
      this.countCost();
    }
  }

  steperChange(liList) {
    liList.forEach((li, index) => {
      if (index !== this.index) {
        li.children[0].classList.remove("item-btn--active");
        li.children[1].classList.remove("item-span--active");
      } else {
        li.children[0].classList.add("item-btn--active");
        li.children[1].classList.add("item-span--active");
      }
    });

    this.currentIndex[0].dataset.steperList = this.index;
  }

  setStyles() {
    const width = this.slickSlide.offsetWidth;
    const left = this.slickIndexes[this.index].offsetLeft;
    const height = this.slickIndexes[this.index].offsetHeight;

    this.slickIndexes.forEach((element) => {
      element.style.width = width + "px";
    });

    this.slickSlide.style.height = height + "px";

    return left;
  }

  //click animation
  clickAnimation() {
    const left = this.setStyles();

    this.content.setAttribute(
      "style",
      "transform: translateX(-" + left + "px); transition: transform 0.6s ease"
    );
  }

  //when page resize
  resizeStyle() {
    const left = this.setStyles();

    this.content.setAttribute(
      "style",
      "transform: translateX(-" + left + "px)"
    );
  }
}
