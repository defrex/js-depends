
dep.require('one');
dep.provide('two');

window.two = 2;

if (
  typeof window.one == 'undefined'
){
  throw('two: deps not met');
}
