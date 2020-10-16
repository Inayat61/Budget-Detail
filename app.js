//Budget controller
var budgetController=(function(){
	var allIncome= function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
	};
	var allExpense= function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
		this.percentage=-1;
	};
	allExpense.prototype.calculatePercentageAll= function(totalIncome){
		if(totalIncome>0){
			this.percentage=Math.round((this.value/totalIncome)*100);
		}else{
			this.percentage=-1;
		}
	};
	allExpense.prototype.getPercentage =function(){
		return this.percentage;
	}
	var calculateTotal = function(type){
			var sum=0;
			data.allItems[type].forEach(function(current){
				sum+=current.value;
			});
			data.totals[type]= sum;
		};
	var data={
		allItems:{
			exp: [],
			inc:[]
		},
		totals:{
			exp: 0,income:0
		},
		budget : 0,
		percentage: 0

	};
	return {
		addItem: function(type,descrip,val){
			var newItem,ID;
			if(data.allItems[type].length >0){
			ID=data.allItems[type][data.allItems[type].length-1].id +1;
			}
			else{
				ID=0;
			}
			if(type==='exp'){
				newItem = new allExpense(ID,descrip,val);
			}else if(type==='inc'){
				newItem = new allIncome(ID,descrip,val);
			}
			data.allItems[type].push(newItem);
			return newItem;
		},
		deleteItem : function(type,id){
			var ids,index;
			ids=data.allItems[type].map(function(current){
				return current.id;
			});

			index=ids.indexOf(id);
			if(index!==-1){
				data.allItems[type].splice(index,1);	
			}
		},
		 calculateBudget: function(){
			calculateTotal(	'exp');
			calculateTotal('inc');
			data.budget= data.totals.inc-data.totals.exp;
			if(data.totals.inc!==0){
			data.percentage= Math.round((data.totals.exp/data.totals.inc)*100);
			}
			else{
				data.percentage=-1;
			}
		},
		calculatePercentage: function(){
			data.allItems.exp.forEach(function(cur){
				cur.calculatePercentageAll(data.totals.inc);
			});

		},
		getPercentages : function(){
			var allPercentages=data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPercentages;
		},
		getBudgetValue: function(){
			return{
			budget:data.budget,
			income: data.totals.inc,
			expense:data.totals.exp,
			percentage:data.percentage
			}
		},
		getTesting: function(){
			console.log(data);
		} 

	};

})();
//UI controller here
var UIController = (function(){
	var DOMdata = {
		inputType : '.add__type',
		inputDescrip: '.add__description',
		inputAmount : '.add__value',
		inputBtn: '.add__btn',
		income: '.income__list',
		expense: '.expenses__list',
		budgetDisplay: '.budget__value',
		headerIncome: '.budget__income--value',
		headerExpense:'.budget__expenses--value',
		headerPercentage: '.budget__expenses--percentage',
		container: '.container',
		expenses_label:'.item__percentage',
		dateLabel: '.budget__title--month'
	};
	var formatNumber= function(num,type){
		var numSplit,int,dec;
		num=Math.abs(num); 
		num=num.toFixed(2);

		numSplit=num.split('.');
		int=numSplit[0];
		dec=numSplit[1];
		if(int.length>3){
			int=int.substr(0,int.length-3)+","+int.substr(int.length-3,int.length);
		}
		dec=numSplit[1];
		;
		return (type==='exp'? '-' : '+')+" "+int+"."+dec;
	};
	var nodeListForEach = function(list,callback){
			for (var i = 0; i < list.length; i++) {
					callback(list[i],i);
				}
			};
	return{
		getInput: function(){
			return{
				type: document.querySelector(DOMdata.inputType).value,
				description: document.querySelector(DOMdata.inputDescrip).value,
				amount: parseFloat(document.querySelector(DOMdata.inputAmount).value)
			};
		},
		addNewItem: function(obj,type){
			var newHtml,html,element;
			if(type==='inc'){
				element=DOMdata.income;
				html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				}
			else if(type==='exp'){
				element=DOMdata.expense;
					html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			newHtml=html.replace('%id%',obj.id);
			newHtml=newHtml.replace('%description%',obj.description);
			newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
						

		},

		deleteListItem : function(selectorID){
			var el=document.getElementById(selectorID);
			el.parentNode.removeChild(el);

		},
		clearFields : function(){
			var fields,fieldInArray;
			fields=document.querySelectorAll(DOMdata.inputDescrip +", "+ DOMdata.inputAmount);
			fieldInArray=Array.prototype.slice.call(fields);

			fieldInArray.forEach(function(current,index,array){
				current.value="";
			});
			fieldInArray[0].focus();
		},
		displayValue: function(obj){
			var type;
			obj.budget>0 ? type='inc' :type ='exp';
			document.querySelector(DOMdata.budgetDisplay).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMdata.headerIncome).textContent = formatNumber(obj.income,'inc');
			document.querySelector(DOMdata.headerExpense).textContent =formatNumber(obj.expense,'exp');
			if(obj.percentage>0){
			document.querySelector(DOMdata.headerPercentage).textContent = obj.percentage+"%";
		}else{
			document.querySelector(DOMdata.headerPercentage).textContent = "-----";

		}
	},
	displayPercentages: function(percentages){
		var field;
		field=document.querySelectorAll(DOMdata.expenses_label);
		nodeListForEach(field,function(current,index){
					if(percentages[index]>0){
						current.textContent=percentages[index]+'%';
					}else{
						current.textContent='---';
					}
				});

	
	},
	displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var work = new Date(2020, 10, 20);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMdata.dateLabel).textContent = months[month] + ' ' + year;
        },
     changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMdata.inputType + ',' +
                DOMdata.inputDescription + ',' +
                DOMdata.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMdata.inputBtn).classList.toggle('red');
            
        },

		getSelectors : function(){
			return DOMdata;
		}
	}
})();
//Universal Controller

var controller = (function (budgetctrl,UICtrl) {
	var updateBudget= function(){
		budgetctrl.calculateBudget();
	var totalBudget = budgetctrl.getBudgetValue();
		UICtrl.displayValue(totalBudget);
	};
	var updatePercentages= function(){
		budgetctrl.calculatePercentage();
		var percentages=budgetctrl.getPercentages();
		UICtrl.displayPercentages(percentages);
	}
	var clickAddItem=function(){

		var inputData,newItem;
		inputData= UICtrl.getInput();
		if(inputData.description!=='' && !(isNaN(inputData.amount)) && inputData.amount>0){
		 newItem=budgetctrl.addItem(inputData.type,inputData.description,inputData.amount);
		UICtrl.addNewItem(newItem,inputData.type);
		UICtrl.clearFields();
		updateBudget();
		updatePercentages();
	};
	};
	var eventListeners=function(){
			var selectors=UICtrl.getSelectors();
		document.querySelector(selectors.inputBtn).addEventListener('click',clickAddItem);
		document.querySelector(selectors.container).addEventListener('click',ctrlDeleteItem);
		document.addEventListener('keypress',function(event){
			if(event.keyCode===13 || event.which===13){
				clickAddItem();
			}
		});
		document.querySelector(selectors.inputType).addEventListener('change',UICtrl.changedType);
	};
	var ctrlDeleteItem = function(event){
		var itemID,type,ID,splitText;

		itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			splitText=itemID.split("-");
			type=splitText[0];
			ID=parseInt(splitText[1]);

			budgetctrl.deleteItem(type,ID);
			UICtrl.deleteListItem(itemID);
			updateBudget();
		}

	}
	
	return{
		init: function(){
			console.log("Application loaded");
			UICtrl.displayMonth();
			eventListeners();
			UICtrl.displayValue({
			budget:0,
			income: 0,
			expense:0,
			percentage:-1
			} );
		}
	}

})(budgetController,UIController);
controller.init();