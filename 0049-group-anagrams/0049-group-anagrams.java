class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        List<List<String>> ans = new ArrayList<>();
        List<String> anagrams = new ArrayList<>();

        for(int i = 0; i< strs.length; i++){
            String word = strs[i];

            char[] arr = word.toCharArray();
            Arrays.sort(arr);
            String sorted = new String(arr);

            int index = anagrams.indexOf(sorted);

            if(index == -1){
                List<String> list = new ArrayList<>();
                list.add(word);
                ans.add(list);
                anagrams.add(sorted);
            }else{
                ans.get(index).add(word);
            }
        }
        return ans;
    }
}