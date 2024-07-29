function Validator(options) {
  const formElement = $(options.form);
  var selectRules = {};

  // Lấy parent của input
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  // Check form
  function validate(inputname, rule) {
    var errorElement = getParent(
      inputname,
      options.formGroupSelector
    ).querySelector(options.errorElementMessage);
    var errorMessage;
    var rules = selectRules[rule.selector];
    
    switch (inputname.type) {
      case 'checkbox':
      case 'radio':
        errorMessage = rules[0](formElement.querySelector(rule.selector + ":checked"));
        break;
      default:
        if (inputname.value === "") {
          errorMessage = rules[0](inputname.value);
        } else {
          errorMessage = rules[1](inputname.value);
        }
    };

    

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputname.parentElement.parentElement.classList.add(
        options.addErrorElementInvalid
      );
    } else {
      errorElement.innerText = "";
      inputname.parentElement.parentElement.classList.remove(
        options.addErrorElementInvalid
      );
    }

    return !!errorMessage;
  }

  if (formElement) {
    // Xử lí submit form
    formElement.onsubmit = (e) => {
      e.preventDefault();

      var isFormValid = false;

      options.rules.forEach((rule) => {
        var inputname = formElement.querySelector(rule.selector);
        var isValid = validate(inputname, rule);

        if (!isValid) {
          isFormValid = true;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");
          var formValues = Array.from(enableInputs).reduce((values, input) => {
            values[input.name] = input.value;
            return values;
          }, {});
          options.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };

    // Xử lí sự kiện lắng nghe(onblur, oninput,...)
    options.rules.forEach((rule) => {
      var inputnames = formElement.querySelectorAll(rule.selector);

      Array.from(inputnames).forEach(inputname => {
        var errorElement = getParent(
          inputname,
          options.formGroupSelector
        ).querySelector(options.errorElementMessage);

        if (inputname) {
          // Xử lí blur
          inputname.onblur = () => {
            validate(inputname, rule);
          };
  
          // Xử lí oninput
          inputname.oninput = () => {
            errorElement.innerText = "";
            getParent(inputname, options.formGroupSelector).classList.remove(
              options.addErrorElementInvalid
            );
          };
        }
      });
      // Lưu lại rule
      if (Array.isArray(selectRules[rule.selector])) {
        selectRules[rule.selector].push(rule.test);
      } else {
        selectRules[rule.selector] = [rule.test];
      }
    });
  }
}

Validator.isRequired = function (selector) {
  return {
    selector,
    test: function (value) {
      return value.trim() ? undefined : "Please enter this form";
    },
  };
};

Validator.isEmail = function (selector) {
  return {
    selector,
    test: function (value) {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(value) ? undefined : "Invalid Email. Please try again";
    },
  };
};

Validator.Password = function (selector) {
  return {
    selector,
    test: function (value) {
      if (value.length < 6) {
        return "Password must have at least 6 characters";
      } else {
        return undefined;
      }
    },
  };
};

Validator.confirmPassword = function (selector, getConfirmValue) {
  return {
    selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : "Confirm password doesn't match your password";
    },
  };
};
