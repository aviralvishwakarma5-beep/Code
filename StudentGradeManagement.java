import java.util.ArrayList;
import java.util.Scanner;

class Student {
    String name;
    ArrayList<Double> grades;

    Student(String name) {
        this.name = name;
        grades = new ArrayList<>();
    }

    void addGrade(double grade) {
        grades.add(grade);
    }

    double getAverage() {
        double sum = 0;
        for (double grade : grades) {
            sum += grade;
        }
        return sum / grades.size();
    }
}

public class StudentGradeManagement {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        ArrayList<Student> students = new ArrayList<>();

        System.out.println("===== STUDENT GRADE MANAGEMENT SYSTEM =====");

        System.out.print("Enter number of students: ");
        int numStudents = sc.nextInt();
        sc.nextLine();

        double highest = Double.MIN_VALUE;
        double lowest = Double.MAX_VALUE;
        String highestStudent = "";
        String lowestStudent = "";

        for (int i = 1; i <= numStudents; i++) {

            System.out.print("\nEnter student name: ");
            String name = sc.nextLine();

            Student student = new Student(name);

            System.out.print("Enter number of subjects: ");
            int subjects = sc.nextInt();

            for (int j = 1; j <= subjects; j++) {

                System.out.print("Enter grade for Subject " + j + ": ");
                double grade = sc.nextDouble();

                student.addGrade(grade);

                if (grade > highest) {
                    highest = grade;
                    highestStudent = name;
                }

                if (grade < lowest) {
                    lowest = grade;
                    lowestStudent = name;
                }
            }

            sc.nextLine();
            students.add(student);
        }

        System.out.println("\n========== SUMMARY REPORT ==========");
        System.out.printf("%-15s %-30s %-10s\n", "Student", "Grades", "Average");
        System.out.println("---------------------------------------------------------------");

        for (Student s : students) {

            System.out.printf("%-15s ", s.name);

            for (double g : s.grades) {
                System.out.printf("%.1f ", g);
            }

            System.out.printf("%15.2f\n", s.getAverage());
        }

        System.out.println("---------------------------------------------------------------");
        System.out.printf("Highest Grade : %.2f (%s)\n", highest, highestStudent);
        System.out.printf("Lowest Grade  : %.2f (%s)\n", lowest, lowestStudent);

        sc.close();
    }
}