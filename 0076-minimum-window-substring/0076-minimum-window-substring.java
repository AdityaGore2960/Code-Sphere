class Solution {
    public String minWindow(String s, String t) {
        int[] count = new int[128];


        //String the frequency of characters in count t[0] = A = 1, t[1]=B=1, t[2]=C=1
        for(int i = 0; i<t.length(); i++){
            count[t.charAt(i)]++;
        }

        int left = 0;
        int start = 0;
        int minLength = Integer.MAX_VALUE;
        int required = t.length();

        //Expand the window
        for(int i = 0; i<s.length(); i++){
            char ch = s.charAt(i);

            if(count[ch] > 0){
                required--;
            }
            count[ch]--;

            while(required == 0){
                if(i - left + 1 < minLength){
                    minLength = i - left + 1;
                    start = left;
                }

                char leftChar = s.charAt(left);

                count[leftChar]++;

                if (count[leftChar] > 0) {
                    required++;
                }
                left++;
                
            }

        }
        if (minLength == Integer.MAX_VALUE) {
                return "";
        }
        return s.substring(start, start + minLength);
    }
        
    
}