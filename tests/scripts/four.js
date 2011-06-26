
dep.require('one');
dep.require('two');
dep.require('three');
dep.provide('four');

if (
  typeof window.one == 'undefined' ||
  typeof window.two == 'undefined' ||
  typeof window.three == 'undefined'
){
  throw('four: deps not met');
}
