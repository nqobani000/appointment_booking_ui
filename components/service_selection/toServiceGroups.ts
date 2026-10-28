import type {ServicePage} from "@/api/types/services";
import type {CustomerType} from "@/api/types/common";
import type {ServiceGroup} from "@/components/service_selection/ServiceOptionGroups";

const formatCategory = (category: string) =>
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace(/_/g, " ");

/** Keeps only services the customer type may book and drops categories left empty. */
export function filterByCustomerType(groups: ServiceGroup[], customerType: CustomerType): ServiceGroup[] {
    return groups
        .map((group) => ({...group, options: group.options.filter((option) => option.availableTo.includes(customerType))}))
        .filter((group) => group.options.length > 0);
}

/** Skips empty categories and treats null fields as absent. */
export function toServiceGroups(content: ServicePage["content"] | null | undefined): ServiceGroup[] {
    return Object.entries(content ?? {})
        .filter(([, services]) => services && services.length > 0)
        .map(([category, services]) => ({
            id: category,
            title: formatCategory(category),
            options: services.map((service) => ({
                id: service.id,
                title: service.name,
                description: service.description?.trim() ?? "",
                availableTo: service.availableTo ?? [],
            })),
        }));
}
