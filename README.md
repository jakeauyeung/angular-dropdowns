基于angularjs的连选指令
===============



使用方法：
```
var app = angular.module('app', ['ngDropdowns']);
```

必须存在：
```
$scope.plSelectSelected = {}; 
```

```
<div dropdown-select="plSelectOptions"
    dropdown-model="plSelectSelected"
    dropdown-item-label="name"
    dropdown-onchange="plrefrechResult(selected)" >
</div>
```
