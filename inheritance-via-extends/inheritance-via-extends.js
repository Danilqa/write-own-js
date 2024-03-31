function myExtends(SuperType, SubType) {
  // Call constructors of both SuperType and SubType
  function ExtendedType(...args) {
    SuperType.call(this, ...args);
    SubType.call(this, ...args);
  }

  // Copy everything from SubType for the future instance objects
  ExtendedType.prototype = SubType.prototype;

  // Inherit properties and methods
  Object.setPrototypeOf(SubType.prototype, SuperType.prototype);

  // Make static properties and methods from super type available
  Object.setPrototypeOf(ExtendedType, SuperType);

  return ExtendedType;
}