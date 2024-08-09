// import java.io.FileWriter; // Import the FileWriter class
// import java.io.IOException; // Import the IOException class to handle errors

class AnotherClass {

}

enum DayOfWeek {
   SUNDAY,
   MONDAY,
   TUESDAY,
   WEDNESDAY,
   THURSDAY,
   FRIDAY,
   SATURDAY
}

public class Probe {
  static native DayOfWeek getEnumValue();
  static native String getStringArg();
  static native void saveNumber(int n);
  static native void saveString(String s);
  static native void saveArray(int[] array);
  static native void saveEnum(DayOfWeek d);
  public static void main(String[] args) {
    saveNumber(123);
    saveString(getStringArg());
    saveArray(new int[]{1, 2, 3});
    saveEnum(DayOfWeek.FRIDAY);
    saveEnum(DayOfWeek.valueOf(getStringArg()));
    // try {
    //   FileWriter myWriter = new FileWriter("/home/filename.txt");
    //   myWriter.write("Files in Java might be tricky, but it is fun enough!");
    //   myWriter.close();
    //   System.out.println("Successfully wrote to the file.");
    // } catch (IOException e) {
    //   System.out.println("An error occurred.");
    //   e.printStackTrace();
    // }
  }
}
