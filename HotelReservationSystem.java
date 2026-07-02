import java.io.*;
import java.util.*;

class Room {
    int roomNo;
    String type;
    double price;
    boolean available;

    Room(int roomNo, String type, double price, boolean available) {
        this.roomNo = roomNo;
        this.type = type;
        this.price = price;
        this.available = available;
    }
}

class Booking {
    String customerName;
    String phone;
    int roomNo;
    String roomType;
    int days;
    double amount;

    Booking(String customerName, String phone, int roomNo, String roomType, int days, double amount) {
        this.customerName = customerName;
        this.phone = phone;
        this.roomNo = roomNo;
        this.roomType = roomType;
        this.days = days;
        this.amount = amount;
    }
}

public class HotelReservationSystem {

    static Scanner sc = new Scanner(System.in);

    static ArrayList<Room> rooms = new ArrayList<>();
    static ArrayList<Booking> bookings = new ArrayList<>();

    static final String FILE_NAME = "bookings.txt";

    public static void main(String[] args) {

        loadRooms();
        loadBookings();

        int choice;

        do {

            System.out.println("\n========== HOTEL RESERVATION SYSTEM ==========");
            System.out.println("1. View Available Rooms");
            System.out.println("2. Search Room by Type");
            System.out.println("3. Book Room");
            System.out.println("4. View Bookings");
            System.out.println("5. Cancel Booking");
            System.out.println("6. Exit");

            System.out.print("Enter Choice: ");
            choice = sc.nextInt();

            switch (choice) {

                case 1:
                    viewRooms();
                    break;

                case 2:
                    searchRoom();
                    break;

                case 3:
                    bookRoom();
                    break;

                case 4:
                    viewBookings();
                    break;

                case 5:
                    cancelBooking();
                    break;

                case 6:
                    saveBookings();
                    System.out.println("Thank You!");
                    break;

                default:
                    System.out.println("Invalid Choice");
            }

        } while (choice != 6);
    }

    static void loadRooms() {

        rooms.add(new Room(101, "Standard", 1000, true));
        rooms.add(new Room(102, "Standard", 1000, true));
        rooms.add(new Room(201, "Deluxe", 2000, true));
        rooms.add(new Room(202, "Deluxe", 2000, true));
        rooms.add(new Room(301, "Suite", 3500, true));
    }

    static void viewRooms() {

        System.out.println("\nAvailable Rooms");

        for (Room r : rooms) {

            if (r.available) {
                System.out.println("Room No : " + r.roomNo +
                        " | Type : " + r.type +
                        " | Price : Rs." + r.price);
            }

        }
    }

    static void searchRoom() {

        System.out.print("Enter Room Type (Standard/Deluxe/Suite): ");
        String type = sc.next();

        boolean found = false;

        for (Room r : rooms) {

            if (r.type.equalsIgnoreCase(type) && r.available) {

                System.out.println("Room " + r.roomNo +
                        " Price: Rs." + r.price);

                found = true;
            }

        }

        if (!found)
            System.out.println("No Rooms Available.");

    }

    static void bookRoom() {

        System.out.print("Enter Name: ");
        sc.nextLine();
        String name = sc.nextLine();

        System.out.print("Enter Phone: ");
        String phone = sc.nextLine();

        viewRooms();

        System.out.print("Enter Room Number: ");
        int roomNo = sc.nextInt();

        Room selected = null;

        for (Room r : rooms) {

            if (r.roomNo == roomNo && r.available) {
                selected = r;
                break;
            }

        }

        if (selected == null) {

            System.out.println("Room Not Available.");
            return;
        }

        System.out.print("Enter Number of Days: ");
        int days = sc.nextInt();

        double total = selected.price * days;

        System.out.println("Total Amount = Rs." + total);

        System.out.println("\nPayment Methods");
        System.out.println("1. Cash");
        System.out.println("2. Card");
        System.out.println("3. UPI");

        System.out.print("Select: ");
        int pay = sc.nextInt();

        if (pay >= 1 && pay <= 3) {

            System.out.println("Payment Successful.");

            selected.available = false;

            bookings.add(new Booking(name,
                    phone,
                    selected.roomNo,
                    selected.type,
                    days,
                    total));

            saveBookings();

            System.out.println("Room Booked Successfully.");

        } else {

            System.out.println("Payment Failed.");

        }

    }

    static void viewBookings() {

        if (bookings.isEmpty()) {

            System.out.println("No Bookings.");
            return;
        }

        System.out.println("\nBooking Details");

        for (Booking b : bookings) {

            System.out.println("----------------------------");
            System.out.println("Customer : " + b.customerName);
            System.out.println("Phone    : " + b.phone);
            System.out.println("Room No  : " + b.roomNo);
            System.out.println("Type     : " + b.roomType);
            System.out.println("Days     : " + b.days);
            System.out.println("Amount   : Rs." + b.amount);
        }

    }

    static void cancelBooking() {

        System.out.print("Enter Room Number to Cancel: ");
        int roomNo = sc.nextInt();

        Booking removeBooking = null;

        for (Booking b : bookings) {

            if (b.roomNo == roomNo) {

                removeBooking = b;
                break;
            }

        }

        if (removeBooking == null) {

            System.out.println("Booking Not Found.");
            return;
        }

        bookings.remove(removeBooking);

        for (Room r : rooms) {

            if (r.roomNo == roomNo) {

                r.available = true;
                break;
            }

        }

        saveBookings();

        System.out.println("Booking Cancelled Successfully.");

    }

    static void saveBookings() {

        try {

            PrintWriter pw = new PrintWriter(new FileWriter(FILE_NAME));

            for (Booking b : bookings) {

                pw.println(
                        b.customerName + "," +
                                b.phone + "," +
                                b.roomNo + "," +
                                b.roomType + "," +
                                b.days + "," +
                                b.amount);

            }

            pw.close();

        } catch (Exception e) {

            System.out.println("Error Saving File.");

        }

    }

    static void loadBookings() {

        File file = new File(FILE_NAME);

        if (!file.exists())
            return;

        try {

            Scanner fileScanner = new Scanner(file);

            while (fileScanner.hasNextLine()) {

                String line = fileScanner.nextLine();

                String[] data = line.split(",");

                Booking b = new Booking(
                        data[0],
                        data[1],
                        Integer.parseInt(data[2]),
                        data[3],
                        Integer.parseInt(data[4]),
                        Double.parseDouble(data[5]));

                bookings.add(b);

                for (Room r : rooms) {

                    if (r.roomNo == b.roomNo) {
                        r.available = false;
                    }

                }

            }

            fileScanner.close();

        } catch (Exception e) {

            System.out.println("Error Loading File.");

        }

    }
}
