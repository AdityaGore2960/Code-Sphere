class Solution {
    public int maxProfit(int[] prices) {

        int minimumPrice = prices[0];
        int maximumProfit = 0;

        for(int i = 1; i < prices.length; i++){

            if(prices[i] < minimumPrice){
                minimumPrice = prices[i];
            }

            int profit = prices[i] - minimumPrice;

            if(profit > maximumProfit){
                maximumProfit = profit;
            }
        }

        return maximumProfit;
    }
}